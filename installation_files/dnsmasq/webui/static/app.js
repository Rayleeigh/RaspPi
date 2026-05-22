const state = {
  servers: [],
  entries: [],
};

const statusPill = document.querySelector("#status-pill");
const message = document.querySelector("#message");
const listenAddress = document.querySelector("#listen-address");
const cacheSize = document.querySelector("#cache-size");
const logQueries = document.querySelector("#log-queries");
const advanced = document.querySelector("#advanced");
const serversList = document.querySelector("#servers-list");
const entriesList = document.querySelector("#entries-list");

function setStatus(text, mode = "idle") {
  statusPill.textContent = text;
  statusPill.dataset.mode = mode;
}

function setMessage(text, mode = "idle") {
  message.textContent = text;
  message.dataset.mode = mode;
}

function field(name, value, placeholder) {
  return `
    <label class="inline-field" for="${name}">
      <span>${placeholder}</span>
      <input id="${name}" value="${value ?? ""}" autocomplete="off" placeholder="${placeholder}">
    </label>
  `;
}

function renderServers() {
  serversList.innerHTML = state.servers
    .map((server, index) => `
      <div class="list-row">
        ${field(`server-${index}`, server, "DNS server IP")}
        <button class="icon-button" type="button" data-remove-server="${index}" aria-label="Remove server">x</button>
      </div>
    `)
    .join("");
}

function renderEntries() {
  entriesList.innerHTML = state.entries
    .map((entry, index) => `
      <div class="entry-row">
        ${field(`domain-${index}`, entry.domain, "Domain")}
        ${field(`ip-${index}`, entry.ip, "IP address")}
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

async function loadConfig() {
  setStatus("Loading", "loading");
  const response = await fetch("/api/config");
  if (!response.ok) {
    throw new Error("Could not load dnsmasq config.");
  }
  hydrate(await response.json());
  setStatus("Ready", "ready");
}

async function saveConfig() {
  setStatus("Saving", "loading");
  setMessage("Saving config and restarting dnsmasq...", "loading");

  const response = await fetch("/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collect()),
  });
  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    setStatus("Needs Fix", "error");
    setMessage(payload.error || "Save failed.", "error");
    return;
  }

  hydrate(payload.config);
  setStatus("Restarted", "ready");
  setMessage("Saved. The dnsmasq container was restarted.", "ready");
}

document.querySelector("#add-server").addEventListener("click", () => {
  collect();
  state.servers.push("");
  renderServers();
});

document.querySelector("#add-entry").addEventListener("click", () => {
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

document.querySelector("#save").addEventListener("click", saveConfig);

loadConfig().catch((error) => {
  setStatus("Error", "error");
  setMessage(error.message, "error");
});
