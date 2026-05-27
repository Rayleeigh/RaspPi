import ipaddress
import json
import os
import re
import subprocess
import tempfile
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


APP_DIR = Path(__file__).resolve().parent
CONTAINER_NAME = os.environ.get("DNSMASQ_CONTAINER", "dnsmasq")
DOCKER_NETWORK = os.environ.get("DOCKER_NETWORK", "private_lab")
PORT = int(os.environ.get("PORT", "8080"))
HOSTS_TARGET = os.environ.get("DNSMASQ_HOSTS_TARGET", "/etc/dnsmasq.hosts")

DOMAIN_RE = re.compile(
    r"^(?=.{1,253}$)([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)*"
    r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$"
)


def resolve_config_path():
    configured_path = os.environ.get("DNSMASQ_CONFIG")
    if configured_path:
        return Path(configured_path)

    candidates = [
        Path("/data/dnsmasq.conf"),
        APP_DIR.parent / "config" / "dnsmasq.conf",
        APP_DIR / "config" / "dnsmasq.conf",
        Path.cwd() / "config" / "dnsmasq.conf",
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate

    return candidates[0]


CONFIG_PATH = resolve_config_path()
HOSTS_PATH = Path(os.environ.get("DNSMASQ_HOSTS", str(CONFIG_PATH.parent / "hosts")))


def add_entry(entries, domain, ip):
    domain = domain.strip().lower()
    ip = ip.strip()
    if not domain or not ip:
        return
    if any(entry["domain"] == domain for entry in entries):
        return
    entries.append({"domain": domain, "ip": ip})


def parse_hosts_file():
    entries = []
    if not HOSTS_PATH.exists():
        return entries

    for raw_line in HOSTS_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.split("#", 1)[0].strip()
        if not line:
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        ip = parts[0]
        for domain in parts[1:]:
            add_entry(entries, domain, ip)
    return entries


def parse_config():
    data = {
        "logQueries": False,
        "listenAddress": "192.168.100.10",
        "cacheSize": 1000,
        "servers": [],
        "entries": [],
        "advanced": [],
    }

    if not CONFIG_PATH.exists():
        data["entries"].append({"domain": "dns.lab", "ip": data["listenAddress"]})
        return data

    for raw_line in CONFIG_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        if line == "log-queries":
            data["logQueries"] = True
        elif line.startswith("listen-address="):
            data["listenAddress"] = line.split("=", 1)[1].strip()
        elif line.startswith("cache-size="):
            value = line.split("=", 1)[1].strip()
            data["cacheSize"] = int(value) if value.isdigit() else 1000
        elif line.startswith("server="):
            data["servers"].append(line.split("=", 1)[1].strip())
        elif line.startswith("addn-hosts="):
            continue
        elif line.startswith("address=/"):
            parts = line.split("/")
            if len(parts) >= 3:
                add_entry(data["entries"], parts[1], parts[2])
            else:
                data["advanced"].append(line)
        else:
            data["advanced"].append(line)

    for entry in parse_hosts_file():
        add_entry(data["entries"], entry["domain"], entry["ip"])

    if not data["servers"]:
        data["servers"] = ["8.8.8.8", "8.8.4.4"]
    if not any(entry["domain"] == "dns.lab" for entry in data["entries"]):
        data["entries"].insert(0, {"domain": "dns.lab", "ip": data["listenAddress"]})

    return data


def validate_ip(value, field):
    try:
        ipaddress.ip_address(value)
    except ValueError as exc:
        raise ValueError(f"{field} must be a valid IP address.") from exc


def validate_domain(value):
    if "/" in value or not DOMAIN_RE.match(value):
        raise ValueError(f"{value} is not a valid domain name.")


def validate_config(payload):
    listen_address = str(payload.get("listenAddress", "")).strip()
    validate_ip(listen_address, "Listen address")

    cache_size = int(payload.get("cacheSize", 1000))
    if cache_size < 0 or cache_size > 100000:
        raise ValueError("Cache size must be between 0 and 100000.")

    servers = [str(item).strip() for item in payload.get("servers", []) if str(item).strip()]
    if not servers:
        raise ValueError("Add at least one upstream DNS server.")
    for server in servers:
        validate_ip(server, "Upstream DNS server")

    entries = []
    seen_domains = set()
    for item in payload.get("entries", []):
        domain = str(item.get("domain", "")).strip().lower()
        ip = str(item.get("ip", "")).strip()
        if not domain and not ip:
            continue
        if not domain or not ip:
            raise ValueError("Every DNS entry needs both a domain and an IP address.")
        validate_domain(domain)
        validate_ip(ip, f"{domain} target")
        if domain in seen_domains:
            raise ValueError(f"{domain} is listed more than once.")
        seen_domains.add(domain)
        entries.append({"domain": domain, "ip": ip})

    raw_advanced = payload.get("advanced", "")
    if isinstance(raw_advanced, list):
        raw_advanced = "\n".join(str(item) for item in raw_advanced)

    advanced = []
    for raw_line in str(raw_advanced).splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith(("log-queries", "listen-address=", "cache-size=", "server=", "address=/")):
            raise ValueError("Use the form fields for log, listen, cache, server, and address entries.")
        advanced.append(line)

    return {
        "logQueries": bool(payload.get("logQueries", False)),
        "listenAddress": listen_address,
        "cacheSize": cache_size,
        "servers": servers,
        "entries": entries,
        "advanced": "\n".join(advanced),
    }


def render_config(data):
    lines = [
        "# Managed by dnsmasq WebGUI",
        "# Log DNS queries",
    ]
    if data["logQueries"]:
        lines.append("log-queries")

    lines.extend(
        [
            "# Listen on fixed ip address",
            f"listen-address={data['listenAddress']}",
            "# Configure DNS caching",
            f"cache-size={data['cacheSize']}",
            "# Read local DNS entries from the managed hosts file",
            f"addn-hosts={HOSTS_TARGET}",
            "# Set DNS forwarders",
        ]
    )
    lines.extend(f"server={server}" for server in data["servers"])
    lines.append("# Custom DNS entries")

    if data["advanced"]:
        lines.extend(["# Advanced options", data["advanced"]])

    return "\n".join(lines).rstrip() + "\n"


def render_hosts(entries):
    lines = ["# Managed by dnsmasq WebGUI"]
    lines.extend(f"{entry['ip']} {entry['domain']}" for entry in entries)
    return "\n".join(lines).rstrip() + "\n"


def write_config(data):
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    content = render_config(data)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=CONFIG_PATH.parent, delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    tmp_path.replace(CONFIG_PATH)

    HOSTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    hosts_content = render_hosts(data["entries"])
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=HOSTS_PATH.parent, delete=False) as tmp:
        tmp.write(hosts_content)
        tmp_path = Path(tmp.name)
    tmp_path.replace(HOSTS_PATH)


def run_docker(args, timeout=10):
    return subprocess.run(
        ["docker", *args],
        check=False,
        capture_output=True,
        text=True,
        timeout=timeout,
    )


def status_from_inspect(inspect_data):
    try:
        state = inspect_data.get("State", {})
    except AttributeError:
        return {"status": "not_available", "detail": "could not read container state"}

    container_name = str(inspect_data.get("Name", "")).lstrip("/")
    raw_status = str(state.get("Status", "")).lower()
    health = state.get("Health", {})
    health_status = str(health.get("Status", "")).lower()
    exit_code = int(state.get("ExitCode") or 0)
    error = str(state.get("Error") or "").strip()

    if state.get("OOMKilled") or raw_status == "dead":
        detail = error or "container was killed"
        return {"status": "killed", "detail": detail, "name": container_name}
    if raw_status == "restarting":
        detail = error or "container is restarting after a crash"
        return {"status": "unhealthy", "detail": detail, "name": container_name}
    if raw_status in {"created", "exited", "paused"}:
        detail = error or f"container is {raw_status}"
        if exit_code:
            detail = f"{detail} with exit code {exit_code}"
        return {"status": "stopped", "detail": detail, "name": container_name}
    if raw_status == "running":
        if health_status == "unhealthy":
            return {"status": "unhealthy", "detail": "container health check is unhealthy", "name": container_name}
        return {"status": "healthy", "detail": "container is running", "name": container_name}

    return {"status": "not_available", "detail": f"unknown container state: {raw_status}", "name": container_name}


def inspect_container(container_ref):
    try:
        result = run_docker(["inspect", container_ref])
    except (FileNotFoundError, subprocess.SubprocessError, subprocess.TimeoutExpired) as exc:
        return {"status": "not_available", "detail": str(exc)}

    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or "container not found"
        return {"status": "not_available", "detail": detail}

    try:
        inspect_data = json.loads(result.stdout)[0]
    except (json.JSONDecodeError, IndexError, KeyError, TypeError) as exc:
        return {"status": "not_available", "detail": f"could not read container state: {exc}"}

    return status_from_inspect(inspect_data)


def container_status():
    return inspect_container(CONTAINER_NAME)


def container_status_for_ip(ip_address):
    match_detail = f"no container on {DOCKER_NETWORK} owns {ip_address}"
    try:
        result = run_docker(["network", "inspect", DOCKER_NETWORK])
    except (FileNotFoundError, subprocess.SubprocessError, subprocess.TimeoutExpired) as exc:
        return {"status": "not_available", "detail": str(exc)}

    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or "network not found"
        return {"status": "not_available", "detail": detail}

    try:
        network_data = json.loads(result.stdout)[0]
    except (json.JSONDecodeError, IndexError, KeyError, TypeError) as exc:
        return {"status": "not_available", "detail": f"could not read Docker network: {exc}"}

    for container_id, container in (network_data.get("Containers") or {}).items():
        ipv4 = str(container.get("IPv4Address") or "").split("/", 1)[0]
        if ipv4 == ip_address:
            status = inspect_container(container_id)
            status["ip"] = ip_address
            status["name"] = status.get("name") or container.get("Name") or container_id[:12]
            return status

    try:
        ps_result = run_docker(["ps", "-a", "-q"])
    except (FileNotFoundError, subprocess.SubprocessError, subprocess.TimeoutExpired):
        ps_result = None

    container_ids = ps_result.stdout.splitlines() if ps_result and ps_result.returncode == 0 else []
    if container_ids:
        inspect_result = run_docker(["inspect", *container_ids], timeout=20)
        if inspect_result.returncode == 0:
            try:
                inspect_items = json.loads(inspect_result.stdout)
            except (json.JSONDecodeError, TypeError):
                inspect_items = []

            for inspect_item in inspect_items:
                network = (inspect_item.get("NetworkSettings", {}).get("Networks") or {}).get(DOCKER_NETWORK) or {}
                configured_ip = (
                    network.get("IPAddress")
                    or (network.get("IPAMConfig") or {}).get("IPv4Address")
                    or ""
                )
                if configured_ip == ip_address:
                    status = status_from_inspect(inspect_item)
                    status["ip"] = ip_address
                    return status

    return {"status": "not_available", "detail": match_detail, "ip": ip_address}


def start_dnsmasq():
    result = run_docker(["start", CONTAINER_NAME], timeout=30)
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or "docker start failed"
        raise RuntimeError(detail)


def reload_dnsmasq():
    result = run_docker(["kill", "--signal", "HUP", CONTAINER_NAME], timeout=30)
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or "docker kill --signal HUP failed"
        raise RuntimeError(detail)


def run_nslookup(query, dns_server):
    result = subprocess.run(
        ["nslookup", query, dns_server],
        check=False,
        capture_output=True,
        text=True,
        timeout=5,
    )
    return result.returncode, "\n".join([result.stdout, result.stderr])


def ping_status(ip_address):
    try:
        result = subprocess.run(
            ["ping", "-c", "1", "-W", "1", ip_address],
            check=False,
            capture_output=True,
            text=True,
            timeout=3,
        )
    except (FileNotFoundError, subprocess.SubprocessError, subprocess.TimeoutExpired) as exc:
        return {"status": "N/A", "detail": str(exc)}

    output = "\n".join([result.stdout, result.stderr]).strip()
    if result.returncode == 0:
        return {"status": "OK", "detail": f"{ip_address} is reachable"}
    return {"status": "N/A", "detail": output or f"{ip_address} is not reachable"}


def normalize_dns_name(value):
    return value.strip().rstrip(".").lower()


def forward_lookup_matches(output, domain, expected_ip):
    expected_domain = re.escape(normalize_dns_name(domain))
    expected_address = re.escape(expected_ip)
    name_match = re.search(rf"(?im)^\s*Name:\s*{expected_domain}\.?\s*$", output)
    address_match = re.search(rf"(?im)^\s*Address:\s*{expected_address}\s*$", output)
    return bool(name_match and address_match)


def reverse_lookup_matches(output, domain):
    expected_domain = re.escape(normalize_dns_name(domain))
    patterns = [
        rf"(?im)^\s*name\s*=\s*{expected_domain}\.?\s*$",
        rf"(?im)^\s*Name:\s*{expected_domain}\.?\s*$",
    ]
    return any(re.search(pattern, output) for pattern in patterns)


def resolve_entry(domain, expected_ip):
    validate_domain(domain)
    validate_ip(expected_ip, f"{domain} target")
    target_container_status = container_status_for_ip(expected_ip)
    target_ping_status = ping_status(expected_ip)
    dns_server = parse_config()["listenAddress"]

    try:
        forward_code, forward_output = run_nslookup(domain, dns_server)
        reverse_code, reverse_output = run_nslookup(expected_ip, dns_server)
    except (FileNotFoundError, subprocess.SubprocessError, subprocess.TimeoutExpired) as exc:
        return {
            "status": "N/A",
            "dns": "N/A",
            "container": target_container_status,
            "ping": target_ping_status,
            "detail": str(exc),
        }

    forward_ok = forward_code == 0 and forward_lookup_matches(forward_output, domain, expected_ip)
    reverse_ok = reverse_code == 0 and reverse_lookup_matches(reverse_output, domain)

    if forward_ok and reverse_ok:
        return {
            "status": "OK",
            "dns": "OK",
            "container": target_container_status,
            "ping": target_ping_status,
            "detail": f"{domain} resolves to {expected_ip} and back",
        }

    failed = []
    if not forward_ok:
        failed.append("forward lookup")
    if not reverse_ok:
        failed.append("reverse lookup")
    detail = "; ".join(failed)
    output = "\n".join([forward_output.strip(), reverse_output.strip()]).strip()
    return {
        "status": "N/A",
        "dns": "N/A",
        "container": target_container_status,
        "ping": target_ping_status,
        "detail": f"{detail} failed. {output}".strip(),
    }


def asset_version():
    paths = [APP_DIR / "server.py", APP_DIR / "static" / "app.css", APP_DIR / "static" / "app.js"]
    newest = max(path.stat().st_mtime for path in paths if path.exists())
    return str(int(newest))


def index_html():
    version = asset_version()
    return f"""<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>dnsmasq web gui</title>
  <link rel="stylesheet" href="/static/app.css?v={version}">
</head>
<body class="dark-mode">
  <header class="app-header">
    <nav class="app-nav" aria-label="Main">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"></div>
        <div>
          <p class="kicker">Lab DNS</p>
          <h1>dnsmasq web gui</h1>
        </div>
      </div>
      <div class="top-actions">
        <div class="language-switch" aria-label="Language">
          <button class="lang-button is-active" type="button" data-lang="de">DE</button>
          <button class="lang-button" type="button" data-lang="en">EN</button>
        </div>
        <button class="info-button" id="tutorial-open" type="button" aria-label="Tutorial">🛈</button>
        <div class="status-pill" id="status-pill">Lädt</div>
      </div>
    </nav>
  </header>

  <main class="app-shell">
    <section class="config-panel">
      <div class="panel-heading">
        <p class="kicker">Resolver</p>
        <h2>Basic settings</h2>
      </div>

      <div class="form-grid">
        <label class="input-wrap" for="listen-address">
          <span>Listen address</span>
          <input id="listen-address" name="listenAddress" autocomplete="off" placeholder="192.168.100.10">
        </label>
        <label class="input-wrap" for="cache-size">
          <span>Cache size</span>
          <input id="cache-size" name="cacheSize" type="number" min="0" max="100000" step="1">
        </label>
      </div>

      <label class="toggle-row" for="log-queries">
        <input id="log-queries" name="logQueries" type="checkbox">
          <span>Log DNS queries</span>
      </label>
    </section>

    <section class="config-panel">
      <div class="panel-heading split">
        <div>
          <p class="kicker">Forwarders</p>
          <h2>Upstream DNS</h2>
        </div>
        <button class="btn-secondary" type="button" id="add-server">Add server</button>
      </div>
      <div class="list-stack" id="servers-list"></div>
    </section>

    <section class="config-panel wide">
      <div class="panel-heading split">
        <div>
          <p class="kicker">Local records</p>
          <h2>DNS entries</h2>
        </div>
        <button class="btn-minimal" type="button" id="add-entry" aria-label="Add DNS entry">Add</button>
      </div>
      <div class="entries-table" id="entries-list" aria-label="DNS entries"></div>
    </section>

    <section class="config-panel wide">
      <div class="panel-heading">
        <p class="kicker">Advanced</p>
        <h2>Extra dnsmasq lines</h2>
      </div>
      <label class="textarea-wrap" for="advanced">
        <span>Options</span>
        <textarea id="advanced" rows="5" spellcheck="false"></textarea>
      </label>
    </section>
  </main>

  <footer class="action-bar">
    <p id="message" role="status">Changes are written to the mounted dnsmasq config file.</p>
    <button class="btn-secondary is-hidden" type="button" id="start-container">Start dnsmasq</button>
    <button class="btn-primary" type="button" id="save">Save and reload</button>
  </footer>

  <dialog class="tutorial-dialog" id="tutorial-dialog" aria-labelledby="tutorial-title">
    <div class="tutorial-card">
      <div class="tutorial-head">
        <div>
          <p class="kicker" data-i18n="tutorialKicker">Kurzanleitung</p>
          <h2 id="tutorial-title" data-i18n="tutorialTitle">DNS und diese Weboberfläche</h2>
        </div>
        <button class="icon-button" id="tutorial-close" type="button" aria-label="Close tutorial">x</button>
      </div>
      <div class="tutorial-layout">
        <div class="tutorial-tabs" role="tablist" aria-label="Tutorial topics">
          <button class="tutorial-tab is-active" type="button" data-topic="use" data-i18n="tutorialUseTitle">WebUI benutzen</button>
          <button class="tutorial-tab" type="button" data-topic="dns" data-i18n="tutorialDnsTitle">Was ist DNS?</button>
          <button class="tutorial-tab" type="button" data-topic="records" data-i18n="tutorialRecordsTitle">Lokale Einträge</button>
          <button class="tutorial-tab" type="button" data-topic="types" data-i18n="tutorialTypesTitle">Record-Typen</button>
        </div>
        <div class="tutorial-body">
          <section class="tutorial-topic is-active" data-topic-panel="use">
            <p class="kicker" data-i18n="tutorialGuidedKicker">Geführter Ablauf</p>
            <h3 data-i18n="tutorialUseTitle">WebUI benutzen</h3>
            <ol>
              <li data-i18n="tutorialUseStep1">Schau oben rechts auf den Status. Nur wenn dnsmasq läuft, kannst du Einträge ändern.</li>
              <li data-i18n="tutorialUseStep2">Gehe zu DNS-Einträge. Dort steht ein Name, zum Beispiel homarr.lab, und die IP-Adresse des passenden Containers.</li>
              <li data-i18n="tutorialUseStep3">Mit Add erstellst du einen neuen Eintrag. Fülle Domain und IP-Adresse aus.</li>
              <li data-i18n="tutorialUseStep4">Speichern schreibt die Datei und startet dnsmasq neu. Danach können Geräte den neuen Namen benutzen.</li>
            </ol>
            <p class="tutorial-note" data-i18n="tutorialUseNote">Wenn du unsicher bist: Ändere nur die DNS-Einträge. Die erweiterten Zeilen sind für Spezialfälle.</p>
          </section>
          <section class="tutorial-topic" data-topic-panel="dns">
            <h3 data-i18n="tutorialDnsTitle">Was ist DNS?</h3>
            <p data-i18n="tutorialDnsIntro">DNS übersetzt Namen in IP-Adressen. Menschen merken sich Namen wie dns.lab einfacher als Zahlen wie 192.168.100.10.</p>
            <h4 data-i18n="tutorialWhyDnsTitle">Warum DNS benutzen?</h4>
            <p data-i18n="tutorialWhyDnsText">Du musst dir keine IP-Adressen merken. Wenn ein Dienst später eine andere IP bekommt, kann der Name gleich bleiben und nur der DNS-Eintrag wird angepasst.</p>
            <h4 data-i18n="tutorialHowDnsTitle">Wie funktioniert DNS grob?</h4>
            <p data-i18n="tutorialHowDnsText">Dein Gerät fragt einen DNS-Server nach einem Namen. Der DNS-Server schaut nach, ob er eine passende Antwort kennt. Wenn ja, gibt er die IP-Adresse zurück. Danach verbindet sich dein Gerät mit dieser IP.</p>
          </section>
          <section class="tutorial-topic" data-topic-panel="records">
            <h3 data-i18n="tutorialRecordsTitle">Lokale Einträge</h3>
            <p data-i18n="tutorialRecordsIntro">Lokale Einträge gelten nur in eurem Labornetz. Sie machen aus einem lokalen Namen wie nginx.lab eine konkrete IP-Adresse.</p>
            <h4 data-i18n="tutorialWhyRecordsTitle">Warum lokale Einträge benutzen?</h4>
            <p data-i18n="tutorialWhyRecordsText">Ihr könnt Container mit klaren Namen öffnen, statt IP-Adressen in den Browser zu tippen. Das ist weniger fehleranfällig und einfacher zu erklären.</p>
            <h4 data-i18n="tutorialRecordExampleTitle">Beispiel</h4>
            <p data-i18n="tutorialRecordExampleText">dns.lab zeigt auf 192.168.100.10. Wenn ein Gerät dns.lab aufruft, antwortet dnsmasq mit dieser IP-Adresse.</p>
          </section>
          <section class="tutorial-topic" data-topic-panel="types">
            <p class="tutorial-note" data-i18n="tutorialOptionalNote">Optional: Das ist nur für Neugierige. Für diese WebUI musst du das nicht auswendig können.</p>
            <h3 data-i18n="tutorialTypesTitle">Record-Typen</h3>
            <dl>
              <dt data-i18n="recordAName">A-Record</dt>
              <dd data-i18n="recordAText">Verbindet einen Namen mit einer IPv4-Adresse, zum Beispiel dns.lab mit 192.168.100.10.</dd>
              <dt data-i18n="recordAAAAName">AAAA-Record</dt>
              <dd data-i18n="recordAAAAText">Verbindet einen Namen mit einer IPv6-Adresse.</dd>
              <dt data-i18n="recordCnameName">CNAME-Record</dt>
              <dd data-i18n="recordCnameText">Macht einen Namen zu einem Alias für einen anderen Namen.</dd>
              <dt data-i18n="recordMxName">MX-Record</dt>
              <dd data-i18n="recordMxText">Sagt, welcher Server E-Mails für eine Domain annimmt.</dd>
            </dl>
          </section>
        </div>
      </div>
    </div>
  </dialog>

  <script src="/static/app.js?v={version}"></script>
</body>
</html>"""


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self.send_text(index_html(), "text/html")
            return
        if parsed.path == "/api/config":
            self.send_json(parse_config())
            return
        if parsed.path == "/api/status":
            self.send_json(container_status())
            return
        if parsed.path == "/api/resolve":
            params = parse_qs(parsed.query)
            domain = params.get("domain", [""])[0].strip()
            expected_ip = params.get("ip", [""])[0].strip()
            try:
                self.send_json(resolve_entry(domain, expected_ip))
            except ValueError as exc:
                self.send_json({"status": "N/A", "detail": str(exc)}, HTTPStatus.BAD_REQUEST)
            return
        super().do_GET()

    def do_POST(self):
        if self.path == "/api/container/start":
            try:
                start_dnsmasq()
                self.send_json({"ok": True, "status": container_status()})
            except Exception as exc:
                self.send_json({"ok": False, "error": str(exc), "status": container_status()}, HTTPStatus.INTERNAL_SERVER_ERROR)
            return

        if self.path != "/api/config":
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            data = validate_config(payload)
            write_config(data)
            reload_dnsmasq()
            self.send_json({"ok": True, "config": parse_config(), "status": container_status()})
        except (ValueError, json.JSONDecodeError) as exc:
            self.send_json({"ok": False, "error": str(exc), "status": container_status()}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            self.send_json({"ok": False, "error": str(exc), "status": container_status()}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def send_text(self, body, content_type="text/plain", status=HTTPStatus.OK):
        encoded = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def send_json(self, payload, status=HTTPStatus.OK):
        self.send_text(json.dumps(payload), "application/json", status)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"dnsmasq WebGUI listening on port {PORT}")
    server.serve_forever()
