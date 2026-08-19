chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) return;

  if (message.type === "PF_FILL_FORM") {
    const result = PFFill.fillForm(message.identity, { overwrite: message.overwrite !== false });
    sendResponse(result);
    return true;
  }

  if (message.type === "PF_FILL_ACTIVE") {
    const result = PFFill.fillActiveField(message.identity);
    sendResponse(result);
    return true;
  }

  if (message.type === "PF_DETECT") {
    const fields = PFFill.collectFields().map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.type || "",
      name: el.name || "",
      detected: PFFill.detectType(el)
    }));
    sendResponse({ fields });
    return true;
  }
});
