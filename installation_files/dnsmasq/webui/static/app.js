const state = {
  lang: "de",
  servers: [],
  entries: [],
  containerStatus: "not_available",
  lastSavedSnapshot: "",
  isSaving: false,
};

const copy = {
  de: {
    appTitle: "dnsmasq WebGUI",
    statusRunning: "Läuft",
    statusHealthy: "Healthy",
    statusUnhealthy: "Unhealthy",
    statusKilled: "Killed",
    statusStopped: "Gestoppt",
    statusRestarting: "Lädt neu",
    statusNotAvailable: "Nicht verfügbar",
    statusLoading: "Lädt",
    statusSaving: "Speichert",
    resolver: "Resolver",
    basicSettings: "Grundeinstellungen",
    listenAddress: "DNS-Adresse",
    cacheSize: "Cache-Grösse",
    logQueries: "DNS-Anfragen protokollieren",
    forwarders: "Weiterleitung",
    upstreamDns: "Upstream DNS",
    addServer: "Server hinzufügen",
    dnsServerIp: "DNS-Server-IP",
    localRecords: "Lokale Einträge",
    dnsEntries: "DNS-Einträge",
    add: "Add",
    addDnsEntry: "DNS-Eintrag hinzufügen",
    entryStatus: "Status",
    dnsStatus: "DNS",
    containerStatus: "Container",
    pingStatus: "Ping",
    domain: "Domain",
    ipAddress: "IP-Adresse",
    advanced: "Erweitert",
    extraLines: "Weitere dnsmasq-Zeilen",
    options: "Optionen",
    save: "Speichern und neu laden",
    start: "dnsmasq starten",
    configNote: "Änderungen werden in die eingebundene dnsmasq-Konfiguration geschrieben.",
    disabledStopped: "dnsmasq ist gestoppt. Starte den Container, bevor du die Konfiguration änderst.",
    disabledMissing: "Der dnsmasq-Container wurde nicht gefunden oder Docker ist nicht erreichbar.",
    restarting: "dnsmasq lädt die Konfiguration neu. Die Konfiguration ist kurz gesperrt.",
    saving: "Konfiguration wird gespeichert und dnsmasq lädt neu...",
    saved: "Gespeichert. dnsmasq hat die Konfiguration neu geladen.",
    autoSaved: "Automatisch gespeichert. dnsmasq hat die Konfiguration neu geladen.",
    startFailed: "dnsmasq konnte nicht gestartet werden.",
    saveFailed: "Speichern fehlgeschlagen.",
    loadFailed: "Die dnsmasq-Konfiguration konnte nicht geladen werden.",
    tutorialKicker: "Kurzanleitung",
    tutorialTitle: "DNS und diese Weboberfläche",
    tutorialUseTitle: "WebUI benutzen",
    tutorialGuidedKicker: "Geführter Ablauf",
    tutorialUseStep1: "Schau oben rechts auf den Status. Nur wenn dnsmasq läuft, kannst du Einträge ändern.",
    tutorialUseStep2: "Gehe zu DNS-Einträge. Dort steht ein Name, zum Beispiel homarr.lab, und die IP-Adresse des passenden Containers.",
    tutorialUseStep3: "Mit Add erstellst du einen neuen Eintrag. Fülle Domain und IP-Adresse aus.",
    tutorialUseStep4: "Speichern schreibt die Datei und sendet dnsmasq ein Reload-Signal. Danach können Geräte den neuen Namen benutzen.",
    tutorialUseNote: "Wenn du unsicher bist: Ändere nur die DNS-Einträge. Die erweiterten Zeilen sind für Spezialfälle.",
    tutorialDnsTitle: "Was ist DNS?",
    tutorialDnsIntro: "DNS übersetzt Namen in IP-Adressen. Menschen merken sich Namen wie dns.lab einfacher als Zahlen wie 192.168.100.10.",
    tutorialWhyDnsTitle: "Warum DNS benutzen?",
    tutorialWhyDnsText: "Du musst dir keine IP-Adressen merken. Wenn ein Dienst später eine andere IP bekommt, kann der Name gleich bleiben und nur der DNS-Eintrag wird angepasst.",
    tutorialHowDnsTitle: "Wie funktioniert DNS grob?",
    tutorialHowDnsText: "Dein Gerät fragt einen DNS-Server nach einem Namen. Der DNS-Server schaut nach, ob er eine passende Antwort kennt. Wenn ja, gibt er die IP-Adresse zurück. Danach verbindet sich dein Gerät mit dieser IP.",
    tutorialRecordsTitle: "Was sind lokale Einträge?",
    tutorialRecordsIntro: "Lokale Einträge gelten nur in eurem Labornetz. Sie machen aus einem lokalen Namen wie nginx.lab eine konkrete IP-Adresse.",
    tutorialWhyRecordsTitle: "Warum lokale Einträge benutzen?",
    tutorialWhyRecordsText: "Ihr könnt Container mit klaren Namen öffnen, statt IP-Adressen in den Browser zu tippen. Das ist weniger fehleranfällig und einfacher zu erklären.",
    tutorialRecordExampleTitle: "Beispiel",
    tutorialRecordExampleText: "dns.lab zeigt auf 192.168.100.10. Wenn ein Gerät dns.lab aufruft, antwortet dnsmasq mit dieser IP-Adresse.",
    tutorialTypesTitle: "Record-Typen",
    tutorialOptionalNote: "Optional: Das ist nur für Neugierige. Für diese WebUI musst du das nicht auswendig können.",
    recordAName: "A-Record",
    recordAText: "Verbindet einen Namen mit einer IPv4-Adresse, zum Beispiel dns.lab mit 192.168.100.10.",
    recordAAAAName: "AAAA-Record",
    recordAAAAText: "Verbindet einen Namen mit einer IPv6-Adresse.",
    recordCnameName: "CNAME-Record",
    recordCnameText: "Macht einen Namen zu einem Alias für einen anderen Namen.",
    recordMxName: "MX-Record",
    recordMxText: "Sagt, welcher Server E-Mails für eine Domain annimmt.",
  },
  en: {
    appTitle: "dnsmasq WebGUI",
    statusRunning: "Running",
    statusHealthy: "Healthy",
    statusUnhealthy: "Unhealthy",
    statusKilled: "Killed",
    statusStopped: "Stopped",
    statusRestarting: "Reloading",
    statusNotAvailable: "Not available",
    statusLoading: "Loading",
    statusSaving: "Saving",
    resolver: "Resolver",
    basicSettings: "Basic settings",
    listenAddress: "Listen address",
    cacheSize: "Cache size",
    logQueries: "Log DNS queries",
    forwarders: "Forwarders",
    upstreamDns: "Upstream DNS",
    addServer: "Add server",
    dnsServerIp: "DNS server IP",
    localRecords: "Local records",
    dnsEntries: "DNS entries",
    add: "Add",
    addDnsEntry: "Add DNS entry",
    entryStatus: "Status",
    dnsStatus: "DNS",
    containerStatus: "Container",
    pingStatus: "Ping",
    domain: "Domain",
    ipAddress: "IP address",
    advanced: "Advanced",
    extraLines: "Extra dnsmasq lines",
    options: "Options",
    save: "Save and reload",
    start: "Start dnsmasq",
    configNote: "Changes are written to the mounted dnsmasq config file.",
    disabledStopped: "dnsmasq is stopped. Start the container before editing the configuration.",
    disabledMissing: "The dnsmasq container was not found or Docker is not reachable.",
    restarting: "dnsmasq is reloading its configuration. Configuration is locked briefly.",
    saving: "Saving config and reloading dnsmasq...",
    saved: "Saved. dnsmasq reloaded its configuration.",
    autoSaved: "Saved automatically. dnsmasq reloaded its configuration.",
    startFailed: "Could not start dnsmasq.",
    saveFailed: "Save failed.",
    loadFailed: "Could not load dnsmasq config.",
    tutorialKicker: "Quick guide",
    tutorialTitle: "DNS and this web interface",
    tutorialUseTitle: "Using the WebUI",
    tutorialGuidedKicker: "Guided flow",
    tutorialUseStep1: "Look at the status in the top-right corner. You can only edit records when dnsmasq is running.",
    tutorialUseStep2: "Go to DNS entries. Each row has a name, such as homarr.lab, and the IP address of the matching container.",
    tutorialUseStep3: "Use Add to create a new entry. Fill in the domain and IP address.",
    tutorialUseStep4: "Save writes the file and sends dnsmasq a reload signal. After that, devices can use the new name.",
    tutorialUseNote: "If you are unsure, only change DNS entries. The advanced lines are for special cases.",
    tutorialDnsTitle: "What is DNS?",
    tutorialDnsIntro: "DNS translates names into IP addresses. Names like dns.lab are easier to remember than numbers like 192.168.100.10.",
    tutorialWhyDnsTitle: "Why use DNS?",
    tutorialWhyDnsText: "You do not need to remember IP addresses. If a service later gets a different IP, the name can stay the same and only the DNS record needs to change.",
    tutorialHowDnsTitle: "How does DNS work at a high level?",
    tutorialHowDnsText: "Your device asks a DNS server for a name. The DNS server checks whether it knows the answer. If it does, it sends back the IP address. Your device then connects to that IP.",
    tutorialRecordsTitle: "What are local records?",
    tutorialRecordsIntro: "Local records only apply inside your lab network. They turn a local name like nginx.lab into a concrete IP address.",
    tutorialWhyRecordsTitle: "Why use local records?",
    tutorialWhyRecordsText: "You can open containers with clear names instead of typing IP addresses into the browser. That is easier to explain and less error-prone.",
    tutorialRecordExampleTitle: "Example",
    tutorialRecordExampleText: "dns.lab points to 192.168.100.10. When a device asks for dns.lab, dnsmasq replies with that IP address.",
    tutorialTypesTitle: "Record types",
    tutorialOptionalNote: "Optional: this is only for curious readers. You do not need to memorise this to use the WebUI.",
    recordAName: "A record",
    recordAText: "Connects a name to an IPv4 address, for example dns.lab to 192.168.100.10.",
    recordAAAAName: "AAAA record",
    recordAAAAText: "Connects a name to an IPv6 address.",
    recordCnameName: "CNAME record",
    recordCnameText: "Makes one name an alias for another name.",
    recordMxName: "MX record",
    recordMxText: "Tells DNS which server accepts email for a domain.",
  },
};

const statusPill = document.querySelector("#status-pill");
const message = document.querySelector("#message");
const listenAddress = document.querySelector("#listen-address");
const cacheSize = document.querySelector("#cache-size");
const logQueries = document.querySelector("#log-queries");
const advanced = document.querySelector("#advanced");
const serversList = document.querySelector("#servers-list");
const entriesList = document.querySelector("#entries-list");
const saveButton = document.querySelector("#save");
const startButton = document.querySelector("#start-container");
const addServerButton = document.querySelector("#add-server");
const addEntryButton = document.querySelector("#add-entry");
const tutorialDialog = document.querySelector("#tutorial-dialog");

function t(key) {
  return copy[state.lang][key] ?? key;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setStatus(status) {
  state.containerStatus = status;
  const labels = {
    running: t("statusRunning"),
    healthy: t("statusHealthy"),
    unhealthy: t("statusUnhealthy"),
    killed: t("statusKilled"),
    stopped: t("statusStopped"),
    restarting: t("statusRestarting"),
    not_available: t("statusNotAvailable"),
    loading: t("statusLoading"),
    saving: t("statusSaving"),
  };
  statusPill.textContent = labels[status] ?? status;
  statusPill.dataset.mode = status;
}

function setMessage(text, mode = "idle") {
  message.textContent = text;
  message.dataset.mode = mode;
}

function field(name, value, label) {
  return `
    <label class="inline-field" for="${name}">
      <span>${escapeHtml(label)}</span>
      <input id="${name}" value="${escapeHtml(value)}" autocomplete="off" placeholder="${escapeHtml(label)}">
    </label>
  `;
}

function entryField(name, value, label) {
  return `
    <label class="inline-field" for="${name}">
      <span>${escapeHtml(label)}</span>
      <input class="dns-entry-input" id="${name}" value="${escapeHtml(value)}" autocomplete="off" placeholder="${escapeHtml(label)}">
    </label>
  `;
}

function renderServers() {
  serversList.innerHTML = state.servers
    .map((server, index) => `
      <div class="list-row">
        ${field(`server-${index}`, server, t("dnsServerIp"))}
        <button class="icon-button" type="button" data-remove-server="${index}" aria-label="Remove server">x</button>
      </div>
    `)
    .join("");
}

function renderEntries() {
  entriesList.innerHTML = state.entries
    .map((entry, index) => `
      <div class="entry-row">
        ${entryField(`domain-${index}`, entry.domain, t("domain"))}
        ${entryField(`ip-${index}`, entry.ip, t("ipAddress"))}
        <div class="record-status" id="entry-status-${index}">
          <div class="status-column dns-status" data-state="checking">
            <span>${t("dnsStatus")}</span>
            <strong>N/A</strong>
          </div>
          <div class="status-column container-status" data-state="checking">
            <span>${t("containerStatus")}</span>
            <strong>N/A</strong>
          </div>
          <div class="status-column ping-status" data-state="checking">
            <span>${t("pingStatus")}</span>
            <strong>N/A</strong>
          </div>
        </div>
        <button class="icon-button" type="button" data-remove-entry="${index}" aria-label="Remove entry">x</button>
      </div>
    `)
    .join("");
  checkEntryStatuses();
}

function collect() {
  state.servers = state.servers.map((_, index) => document.querySelector(`#server-${index}`).value.trim());
  state.entries = state.entries.map((_, index) => ({
    domain: document.querySelector(`#domain-${index}`).value.trim(),
    ip: document.querySelector(`#ip-${index}`).value.trim(),
  }));

  return {
    listenAddress: listenAddress.value.trim(),
    cacheSize: Number(cacheSize.value),
    logQueries: logQueries.checked,
    servers: state.servers,
    entries: state.entries,
    advanced: advanced.value,
  };
}

function snapshot(payload = collect()) {
  return JSON.stringify(payload);
}

function hydrate(config) {
  listenAddress.value = config.listenAddress;
  cacheSize.value = config.cacheSize;
  logQueries.checked = config.logQueries;
  advanced.value = Array.isArray(config.advanced) ? config.advanced.join("\n") : config.advanced;
  state.servers = config.servers.length ? config.servers : ["8.8.8.8", "8.8.4.4"];
  state.entries = config.entries;
  renderServers();
  renderEntries();
  state.lastSavedSnapshot = snapshot();
}

function setDisabled(disabled) {
  document.querySelector(".app-shell").classList.toggle("is-disabled", disabled);
  saveButton.disabled = disabled;
  addServerButton.disabled = disabled;
  addEntryButton.disabled = disabled;
  document.querySelectorAll(".app-shell input, .app-shell textarea, .app-shell button").forEach((control) => {
    control.disabled = disabled;
  });
}

function containerStatusLabel(status) {
  const labels = {
    healthy: t("statusHealthy"),
    unhealthy: t("statusUnhealthy"),
    killed: t("statusKilled"),
    stopped: t("statusStopped"),
    restarting: t("statusRestarting"),
    not_available: t("statusNotAvailable"),
    loading: t("statusLoading"),
    saving: t("statusSaving"),
    running: t("statusRunning"),
  };
  return labels[status] ?? status;
}

function recordStatusLabel(status) {
  if (status === "not_available") return "N/A";
  return containerStatusLabel(status);
}

function applyContainerState(status) {
  setStatus(status);
  startButton.classList.toggle("is-hidden", !["stopped", "killed"].includes(status));

  if (status === "healthy" || status === "running") {
    setDisabled(false);
    setMessage(t("configNote"));
    return;
  }

  setDisabled(true);
  if (status === "stopped") {
    setMessage(t("disabledStopped"), "blocked");
  } else if (status === "restarting") {
    setMessage(t("restarting"), "loading");
  } else {
    setMessage(t("disabledMissing"), "blocked");
  }
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll(".lang-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === state.lang);
  });

  document.querySelector("h1").textContent = t("appTitle");
  document.querySelector(".config-panel:nth-of-type(1) .kicker").textContent = t("resolver");
  document.querySelector(".config-panel:nth-of-type(1) h2").textContent = t("basicSettings");
  document.querySelector('label[for="listen-address"] span').textContent = t("listenAddress");
  document.querySelector('label[for="cache-size"] span').textContent = t("cacheSize");
  document.querySelector(".toggle-row span").textContent = t("logQueries");
  document.querySelector(".config-panel:nth-of-type(2) .kicker").textContent = t("forwarders");
  document.querySelector(".config-panel:nth-of-type(2) h2").textContent = t("upstreamDns");
  addServerButton.textContent = t("addServer");
  document.querySelector(".config-panel:nth-of-type(3) .kicker").textContent = t("localRecords");
  document.querySelector(".config-panel:nth-of-type(3) h2").textContent = t("dnsEntries");
  addEntryButton.textContent = t("add");
  addEntryButton.setAttribute("aria-label", t("addDnsEntry"));
  document.querySelector(".config-panel:nth-of-type(4) .kicker").textContent = t("advanced");
  document.querySelector(".config-panel:nth-of-type(4) h2").textContent = t("extraLines");
  document.querySelector('label[for="advanced"] span').textContent = t("options");
  saveButton.textContent = t("save");
  startButton.textContent = t("start");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  renderServers();
  renderEntries();
  applyContainerState(state.containerStatus);
}

function selectTutorialTopic(topic) {
  document.querySelectorAll(".tutorial-tab").forEach((button) => {
    const active = button.dataset.topic === topic;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".tutorial-topic").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.topicPanel === topic);
  });
}

async function loadConfig() {
  setStatus("loading");
  const response = await fetch("/api/config");
  if (!response.ok) {
    throw new Error(t("loadFailed"));
  }
  hydrate(await response.json());
}

async function refreshStatus() {
  try {
    const response = await fetch("/api/status");
    if (!response.ok) {
      applyContainerState("not_available");
      return;
    }
    const payload = await response.json();
    applyContainerState(payload.status);
  } catch {
    applyContainerState("not_available");
  }
}

async function saveConfig(options = {}) {
  if (state.isSaving) return;
  state.isSaving = true;
  setStatus("restarting");
  setDisabled(true);
  setMessage(t("saving"), "loading");

  let response;
  let payload;
  try {
    response = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collect()),
    });
    payload = await response.json();
  } catch (error) {
    await refreshStatus();
    setMessage(error.message || t("saveFailed"), "error");
    state.isSaving = false;
    return;
  }

  if (!response.ok || !payload.ok) {
    applyContainerState(payload.status?.status ?? "not_available");
    setMessage(payload.error || t("saveFailed"), "error");
    state.isSaving = false;
    return;
  }

  hydrate(payload.config);
  applyContainerState(payload.status?.status ?? "healthy");
  state.lastSavedSnapshot = snapshot();
  setMessage(options.auto ? t("autoSaved") : t("saved"), "ready");
  checkEntryStatuses();
  state.isSaving = false;
}

async function autoSaveDnsEntries() {
  if (!["healthy", "running"].includes(state.containerStatus)) return;
  if (state.entries.some((entry) => Boolean(entry.domain) !== Boolean(entry.ip))) return;
  const currentSnapshot = snapshot();
  if (currentSnapshot === state.lastSavedSnapshot) return;
  await saveConfig({ auto: true });
}

async function checkEntryStatuses() {
  if (!entriesList.children.length) return;
  const entries = state.entries.map((entry) => ({ ...entry }));
  await Promise.all(entries.map(async (entry, index) => {
    const badge = document.querySelector(`#entry-status-${index}`);
    if (!badge || !entry.domain || !entry.ip) return;
    const dnsBadge = badge.querySelector(".dns-status");
    dnsBadge.dataset.state = "checking";
    dnsBadge.querySelector("strong").textContent = "N/A";
    try {
      const params = new URLSearchParams({ domain: entry.domain, ip: entry.ip });
      const response = await fetch(`/api/resolve?${params.toString()}`);
      const payload = await response.json();
      const containerBadge = badge.querySelector(".container-status");
      const pingBadge = badge.querySelector(".ping-status");
      const containerState = payload.container?.status ?? state.containerStatus;
      const pingState = payload.ping?.status === "OK" ? "ok" : "na";
      dnsBadge.dataset.state = payload.dns === "OK" || payload.status === "OK" ? "ok" : "na";
      dnsBadge.querySelector("strong").textContent = payload.dns === "OK" || payload.status === "OK" ? "OK" : "N/A";
      containerBadge.dataset.state = containerState;
      containerBadge.querySelector("strong").textContent = recordStatusLabel(containerState);
      containerBadge.title = [payload.container?.name, payload.container?.detail].filter(Boolean).join(": ");
      pingBadge.dataset.state = pingState;
      pingBadge.querySelector("strong").textContent = payload.ping?.status === "OK" ? "OK" : "N/A";
      pingBadge.title = payload.ping?.detail || "";
      badge.title = payload.detail || "";
    } catch {
      const dnsBadge = badge.querySelector(".dns-status");
      const pingBadge = badge.querySelector(".ping-status");
      dnsBadge.dataset.state = "na";
      dnsBadge.querySelector("strong").textContent = "N/A";
      pingBadge.dataset.state = "na";
      pingBadge.querySelector("strong").textContent = "N/A";
    }
  }));
}

async function startContainer() {
  setStatus("restarting");
  setMessage(t("restarting"), "loading");
  startButton.disabled = true;
  const response = await fetch("/api/container/start", { method: "POST" });
  const payload = await response.json();
  startButton.disabled = false;

  if (!response.ok || !payload.ok) {
    applyContainerState(payload.status?.status ?? "not_available");
    setMessage(payload.error || t("startFailed"), "error");
    return;
  }

  applyContainerState(payload.status?.status ?? "healthy");
}

addServerButton.addEventListener("click", () => {
  collect();
  state.servers.push("");
  renderServers();
});

addEntryButton.addEventListener("click", () => {
  collect();
  state.entries.push({ domain: "", ip: "" });
  renderEntries();
});

serversList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-server]");
  if (!button) return;
  collect();
  state.servers.splice(Number(button.dataset.removeServer), 1);
  renderServers();
});

entriesList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-entry]");
  if (!button) return;
  collect();
  state.entries.splice(Number(button.dataset.removeEntry), 1);
  renderEntries();
});

entriesList.addEventListener("focusout", (event) => {
  if (!event.target.matches(".dns-entry-input")) return;
  collect();
  autoSaveDnsEntries();
});

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.lang;
    applyLanguage();
  });
});

document.querySelector("#tutorial-open").addEventListener("click", () => {
  selectTutorialTopic("use");
  if (typeof tutorialDialog.showModal === "function") {
    tutorialDialog.showModal();
  } else {
    tutorialDialog.setAttribute("open", "");
  }
});

document.querySelector("#tutorial-close").addEventListener("click", () => {
  tutorialDialog.close();
});

tutorialDialog.addEventListener("click", (event) => {
  if (event.target === tutorialDialog) {
    tutorialDialog.close();
  }
});

document.querySelectorAll(".tutorial-tab").forEach((button) => {
  button.addEventListener("click", () => {
    selectTutorialTopic(button.dataset.topic);
  });
});

saveButton.addEventListener("click", saveConfig);
startButton.addEventListener("click", startContainer);

applyLanguage();
loadConfig()
  .then(refreshStatus)
  .catch((error) => {
    setStatus("not_available");
    setMessage(error.message, "error");
    setDisabled(true);
  });
setInterval(refreshStatus, 5000);
