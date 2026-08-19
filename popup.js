const $ = (id) => document.getElementById(id);

function render(identity) {
  $("fullName").textContent = identity.fullName;
  $("username").textContent = identity.username;
  $("email").textContent = identity.email;
  $("password").textContent = identity.password;
  $("phone").textContent = identity.phone;
  $("address").textContent = identity.address;
  $("postalCode").textContent = identity.postalCode;
  $("documentId").textContent = identity.documentId;
  $("genderBadge").textContent = identity.genderLabel;
  $("genderBadge").className = `badge ${identity.gender}`;
  $("localePill").textContent = identity.countryCode;
}

function setStatus(text, ok = false) {
  const el = $("status");
  el.textContent = text;
  el.classList.toggle("ok", ok);
}

async function currentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function fillPage(forceNew = false) {
  const tab = await currentTab();
  if (!tab?.id) {
    setStatus("No hay una pestaña activa.");
    return;
  }
  if (!/^https?:/.test(tab.url || "")) {
    setStatus("Abre un sitio http/https para rellenar.");
    return;
  }
  setStatus("Rellenando…");
  chrome.runtime.sendMessage(
    { type: "PF_FILL_ACTIVE_TAB", tabId: tab.id, fillType: "PF_FILL_FORM", forceNew },
    (result) => {
      if (chrome.runtime.lastError) {
        setStatus(chrome.runtime.lastError.message);
        return;
      }
      if (result?.error) {
        setStatus(result.error);
        return;
      }
      setStatus(`Listo: ${result?.filled ?? 0} campos rellenados.`, true);
    }
  );
}

async function init() {
  const settings = await PFStorage.getSettings();
  $("gender").value = settings.gender || "random";
  $("locale").value = settings.locale || "mx";
  const identity = await PFStorage.getOrCreateIdentity();
  render(identity);
}

async function applyFilters() {
  await PFStorage.saveSettings({
    gender: $("gender").value,
    locale: $("locale").value
  });
  const identity = await PFStorage.newIdentity();
  render(identity);
  setStatus("Identidad actualizada.", true);
}

$("gender").addEventListener("change", applyFilters);
$("locale").addEventListener("change", applyFilters);

$("generate").addEventListener("click", async () => {
  const identity = await PFStorage.newIdentity();
  render(identity);
  setStatus("Nueva identidad lista.", true);
});

$("fill").addEventListener("click", () => fillPage(false));

$("copyJson").addEventListener("click", async () => {
  const identity = await PFStorage.getIdentity();
  await navigator.clipboard.writeText(JSON.stringify(identity, null, 2));
  setStatus("JSON copiado.", true);
});

$("openOptions").addEventListener("click", () => chrome.runtime.openOptionsPage());

$("saveProfile").addEventListener("click", async () => {
  const identity = await PFStorage.getIdentity();
  const name = prompt("Nombre del perfil", identity.fullName);
  if (!name) return;
  await PFStorage.saveProfile(name, identity);
  setStatus("Perfil guardado en Ajustes.", true);
});

document.querySelectorAll("[data-copy]").forEach((el) => {
  el.addEventListener("click", async () => {
    await navigator.clipboard.writeText(el.textContent.trim());
    setStatus(`Copiado: ${el.textContent.trim()}`, true);
  });
});

init();
