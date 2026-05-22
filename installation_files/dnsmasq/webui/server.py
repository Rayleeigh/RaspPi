import html
import ipaddress
import json
import os
import re
import subprocess
import tempfile
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


APP_DIR = Path(__file__).resolve().parent
CONFIG_PATH = Path(os.environ.get("DNSMASQ_CONFIG", "/data/dnsmasq.conf"))
CONTAINER_NAME = os.environ.get("DNSMASQ_CONTAINER", "dnsmasq")
PORT = int(os.environ.get("PORT", "8080"))

DOMAIN_RE = re.compile(
    r"^(?=.{1,253}$)([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)*"
    r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$"
)


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
        elif line.startswith("address=/"):
            parts = line.split("/")
            if len(parts) >= 3:
                data["entries"].append({"domain": parts[1].strip(), "ip": parts[2].strip()})
            else:
                data["advanced"].append(line)
        else:
            data["advanced"].append(line)

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

    advanced = []
    for raw_line in str(payload.get("advanced", "")).splitlines():
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
            "# Set DNS forwarders",
        ]
    )
    lines.extend(f"server={server}" for server in data["servers"])
    lines.append("# Custom DNS entries")
    lines.extend(f"address=/{entry['domain']}/{entry['ip']}" for entry in data["entries"])

    if data["advanced"]:
        lines.extend(["# Advanced options", data["advanced"]])

    return "\n".join(lines).rstrip() + "\n"


def write_config(data):
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    content = render_config(data)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=CONFIG_PATH.parent, delete=False) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    tmp_path.replace(CONFIG_PATH)


def restart_dnsmasq():
    result = subprocess.run(
        ["docker", "restart", CONTAINER_NAME],
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or "docker restart failed"
        raise RuntimeError(detail)


def index_html():
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>dnsmasq web gui</title>
  <link rel="stylesheet" href="/static/app.css">
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
      <div class="status-pill" id="status-pill">Loading</div>
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
    <p id="message" role="status">Changes are written to {html.escape(str(CONFIG_PATH))}.</p>
    <button class="btn-primary" type="button" id="save">Save and restart</button>
  </footer>

  <script src="/static/app.js"></script>
</body>
</html>"""


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def do_GET(self):
        if self.path == "/":
            self.send_text(index_html(), "text/html")
            return
        if self.path == "/api/config":
            self.send_json(parse_config())
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/config":
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            data = validate_config(payload)
            write_config(data)
            restart_dnsmasq()
            self.send_json({"ok": True, "config": parse_config()})
        except (ValueError, json.JSONDecodeError) as exc:
            self.send_json({"ok": False, "error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            self.send_json({"ok": False, "error": str(exc)}, HTTPStatus.INTERNAL_SERVER_ERROR)

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
