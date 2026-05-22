const state = {
  lang: "de",
  servers: [],
  entries: [],
  containerStatus: "not_available",
};

const copy = {
  de: {
    appTitle: "dnsmasq WebGUI",
    statusRunning: "Läuft",
    statusStopped: "Gestoppt",
    statusRestarting: "Startet neu",
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
    domain: "Domain",
    ipAddress: "IP-Adresse",
    advanced: "Erweitert",
    extraLines: "Weitere dnsmasq-Zeilen",
    options: "Optionen",
    save: "Speichern und neu starten",
    start: "dnsmasq starten",
    configNote: "Änderungen werden in die eingebundene dnsmasq-Konfiguration geschrieben.",
    disabledStopped: "dnsmasq ist gestoppt. Starte den Container, bevor du die Konfiguration änderst.",
    disabledMissing: "Der dnsmasq-Container wurde nicht gefunden oder Docker ist nicht erreichbar.",
    restarting: "dnsmasq startet neu. Die Konfiguration ist kurz gesperrt.",
    saving: "Konfiguration wird gespeichert und dnsmasq wird neu gestartet...",
    saved: "Gespeichert. dnsmasq wurde neu gestartet.",
    startFailed: "dnsmasq konnte nicht gestartet werden.",
    saveFailed: "Speichern fehlgeschlagen.",
    loadFailed: "Die dnsmasq-Konfiguration konnte nicht geladen werden.",
    tutorialKicker: "Kurzanleitung",
    tutorialTitle: "DNS und diese Weboberfläche",
    tutorialUseTitle: "So benutzt du die WebUI",
    tutorialUseText: "Prüfe zuerst, ob dnsmasq läuft. Danach kannst du unter DNS-Einträge Namen wie homarr.lab eintragen und auf eine IP-Adresse zeigen lassen. Speichern schreibt die Konfiguration und startet dnsmasq neu, damit die Änderung aktiv wird.",
    tutorialDnsTitle: "Was ist DNS?",
    tutorialDnsText: "DNS ist wie ein Telefonbuch für Netzwerke. Dein Browser fragt nach einem Namen wie dns.lab. Der DNS-Server antwortet mit der passenden IP-Adresse, damit dein Gerät weiss, wohin es verbinden soll.",
    tutorialRecordsTitle: "Was sind lokale Einträge?",
    tutorialRecordsText: "Lokale Einträge gelten nur in eurem Labornetz. dns.lab zeigt auf den dnsmasq-Container. Weitere Einträge können auf Homarr, Samba, NGINX oder andere Container zeigen.",
  },
  en: {
    appTitle: "dnsmasq WebGUI",
    statusRunning: "Running",
    statusStopped: "Stopped",
    statusRestarting: "Restarting",
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
    domain: "Domain",
    ipAddress: "IP address",
    advanced: "Advanced",
    extraLines: "Extra dnsmasq lines",
    options: "Options",
    save: "Save and restart",
    start: "Start dnsmasq",
    configNote: "Changes are written to the mounted dnsmasq config file.",
    disabledStopped: "dnsmasq is stopped. Start the container before editing the configuration.",
    disabledMissing: "The dnsmasq container was not found or Docker is not reachable.",
    restarting: "dnsmasq is restarting. Configuration is locked briefly.",
    saving: "Saving config and restarting dnsmasq...",
    saved: "Saved. dnsmasq was restarted.",
    startFailed: "Could not start dnsmasq.",
    saveFailed: "Save failed.",
    loadFailed: "Could not load dnsmasq config.",
    tutorialKicker: "Quick guide",
    tutorialTitle: "DNS and this web interface",
    tutorialUseTitle: "How to use the WebUI",
    tutorialUseText: "First check whether dnsmasq is running. Then add names such as homarr.lab under DNS entries and point them to an IP address. Saving writes the configuration and restarts dnsmasq so the change becomes active.",
    tutorialDnsTitle: "What is DNS?",
    tutorialDnsText: "DNS is like a phone book for networks. Your browser asks for a name such as dns.lab. The DNS server replies with the matching IP address, so your device knows where to connect.",
    tutorialRecordsTitle: "What are local records?",
    tutorialRecordsText: "Local records only apply inside your lab network. dns.lab points to the dnsmasq container. Other records can point to Homarr, Samba, NGINX, or other containers.",
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
        ${field(`domain-${index}`, entry.domain, t("domain"))}
        ${field(`ip-${index}`, entry.ip, t("ipAddress"))}
        <button class="icon-button" type="button" data-remove-entry="${index}" aria-label="Remove entry">x</button>
      </div>
    `)
    .join("");
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

function hydrate(config) {
  listenAddress.value = config.listenAddress;
  cacheSize.value = config.cacheSize;
  logQueries.checked = config.logQueries;
  advanced.value = Array.isArray(config.advanced) ? config.advanced.join("\n") : config.advanced;
  state.servers = config.servers.length ? config.servers : ["8.8.8.8", "8.8.4.4"];
  state.entries = config.entries;
  renderServers();
  renderEntries();
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

function applyContainerState(status) {
  setStatus(status);
  startButton.classList.toggle("is-hidden", status !== "stopped");

  if (status === "running") {
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

async function saveConfig() {
  setStatus("restarting");
  setDisabled(true);
  setMessage(t("saving"), "loading");

  const response = await fetch("/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collect()),
  });
  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    applyContainerState(payload.status?.status ?? "not_available");
    setMessage(payload.error || t("saveFailed"), "error");
    return;
  }

  hydrate(payload.config);
  applyContainerState(payload.status?.status ?? "running");
  setMessage(t("saved"), "ready");
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

  applyContainerState(payload.status?.status ?? "running");
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

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.lang;
    applyLanguage();
  });
});

document.querySelector("#tutorial-open").addEventListener("click", () => {
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
