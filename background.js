importScripts("lib/defaults.js", "lib/generator.js");

function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "pf-fill-form",
      title: "PersonaFake: rellenar formulario",
      contexts: ["page", "editable", "frame"]
    });
    chrome.contextMenus.create({
      id: "pf-fill-field",
      title: "PersonaFake: rellenar este campo",
      contexts: ["editable"]
    });
    chrome.contextMenus.create({
      id: "pf-new-and-fill",
      title: "PersonaFake: nueva identidad y rellenar",
      contexts: ["page", "editable", "frame"]
    });
  });
}

async function getIdentity(forceNew = false) {
  const settings = (await chrome.storage.local.get("pf_settings")).pf_settings || {};
  if (forceNew) {
    const identity = PersonaFake.generate({ ...PF_DEFAULTS, ...settings });
    await chrome.storage.local.set({ pf_identity: identity });
    return identity;
  }
  const stored = (await chrome.storage.local.get("pf_identity")).pf_identity;
  if (stored) return stored;
  const identity = PersonaFake.generate({ ...PF_DEFAULTS, ...settings });
  await chrome.storage.local.set({ pf_identity: identity });
  return identity;
}

async function fillInTab(tabId, type, forceNew = false) {
  const settings = (await chrome.storage.local.get("pf_settings")).pf_settings || {};
  const identity = await getIdentity(forceNew);
  const overwrite = settings.overwrite !== false;

  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ["lib/fill.js"]
    });
  } catch (err) {
    return { error: "No se puede inyectar en esta página. Abre un sitio http o https." };
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    func: (persona, overwriteFields, fillType) => {
      if (typeof PFFill === "undefined") return { filled: 0 };
      if (fillType === "PF_FILL_ACTIVE") return PFFill.fillActiveField(persona);
      return PFFill.fillForm(persona, { overwrite: overwriteFields });
    },
    args: [identity, overwrite, type]
  });

  const filled = (results || []).reduce((sum, item) => sum + (item.result?.filled || 0), 0);
  return { filled, frames: results?.length || 0 };
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId === "pf-fill-form") {
    await fillInTab(tab.id, "PF_FILL_FORM");
  }
  if (info.menuItemId === "pf-fill-field") {
    await fillInTab(tab.id, "PF_FILL_ACTIVE");
  }
  if (info.menuItemId === "pf-new-and-fill") {
    await fillInTab(tab.id, "PF_FILL_FORM", true);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  if (command === "fill-form") await fillInTab(tab.id, "PF_FILL_FORM");
  if (command === "new-identity") await fillInTab(tab.id, "PF_FILL_FORM", true);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "PF_FILL_ACTIVE_TAB") {
    fillInTab(message.tabId, message.fillType || "PF_FILL_FORM", Boolean(message.forceNew))
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});
