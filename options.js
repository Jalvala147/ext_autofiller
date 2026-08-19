const $ = (id) => document.getElementById(id);

function lines(text) {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function showFlash(text) {
  const el = $("flash");
  el.hidden = false;
  el.textContent = text;
  setTimeout(() => {
    el.hidden = true;
  }, 2200);
}

function customRow(field = { key: "", mode: "fixed", value: "" }) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input class="key" placeholder="coupon, referido, sku" value="${field.key || ""}" /></td>
    <td>
      <select class="mode">
        <option value="fixed" ${field.mode !== "random" ? "selected" : ""}>Fijo</option>
        <option value="random" ${field.mode === "random" ? "selected" : ""}>Aleatorio</option>
      </select>
    </td>
    <td><input class="value" placeholder="TEST-{4d}" value="${field.value || ""}" /></td>
    <td><button type="button" class="remove">Quitar</button></td>
  `;
  tr.querySelector(".remove").addEventListener("click", () => tr.remove());
  return tr;
}

function readCustomFields() {
  return [...$("customRows").querySelectorAll("tr")].map((tr) => ({
    key: tr.querySelector(".key").value.trim(),
    mode: tr.querySelector(".mode").value,
    value: tr.querySelector(".value").value
  })).filter((f) => f.key);
}

function fillForm(settings) {
  $("gender").value = settings.gender;
  $("locale").value = settings.locale;
  $("overwrite").checked = settings.overwrite !== false;
  $("passwordMode").value = settings.passwordMode;
  $("fixedPassword").value = settings.fixedPassword;
  $("passwordLength").value = settings.passwordLength;
  $("usernameFormat").value = settings.usernameFormat;
  $("emailFormat").value = settings.emailFormat;
  $("domains").value = (settings.domains || []).join("\n");
  $("company").value = settings.extra?.company || "";
  $("jobTitle").value = settings.extra?.jobTitle || "";
  $("website").value = settings.extra?.website || "";
  $("maleNames").value = (settings.maleNames || []).join("\n");
  $("femaleNames").value = (settings.femaleNames || []).join("\n");
  $("lastNames").value = (settings.lastNames || []).join("\n");
  $("streets").value = (settings.streets || []).join("\n");
  $("customRows").innerHTML = "";
  const fields = settings.customFields?.length ? settings.customFields : [{ key: "", mode: "fixed", value: "" }];
  fields.forEach((field) => $("customRows").appendChild(customRow(field)));
}

async function save() {
  const settings = await PFStorage.saveSettings({
    gender: $("gender").value,
    locale: $("locale").value,
    overwrite: $("overwrite").checked,
    passwordMode: $("passwordMode").value,
    fixedPassword: $("fixedPassword").value,
    passwordLength: Number($("passwordLength").value) || 12,
    usernameFormat: $("usernameFormat").value,
    emailFormat: $("emailFormat").value,
    domains: lines($("domains").value),
    maleNames: lines($("maleNames").value),
    femaleNames: lines($("femaleNames").value),
    lastNames: lines($("lastNames").value),
    streets: lines($("streets").value),
    customFields: readCustomFields(),
    extra: {
      company: $("company").value.trim(),
      jobTitle: $("jobTitle").value.trim(),
      website: $("website").value.trim()
    }
  });
  fillForm(settings);
  showFlash("Cambios guardados.");
}

async function renderProfiles() {
  const profiles = await PFStorage.getProfiles();
  const list = $("profileList");
  list.innerHTML = "";
  if (!profiles.length) {
    list.innerHTML = "<li>Todavía no hay perfiles. Genera uno en el popup y pulsa Guardar perfil.</li>";
    return;
  }
  for (const profile of profiles) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${profile.name}</strong>
        <div>${profile.identity.email} · ${profile.identity.username}</div>
      </div>
      <div>
        <button type="button" class="use">Usar</button>
        <button type="button" class="danger delete">Borrar</button>
      </div>
    `;
    li.querySelector(".use").addEventListener("click", async () => {
      await PFStorage.saveIdentity(profile.identity);
      showFlash(`Perfil activo: ${profile.name}`);
    });
    li.querySelector(".delete").addEventListener("click", async () => {
      await PFStorage.deleteProfile(profile.id);
      await renderProfiles();
    });
    list.appendChild(li);
  }
}

document.querySelectorAll(".tabs button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
  });
});

$("addCustom").addEventListener("click", () => {
  $("customRows").appendChild(customRow());
});

$("resetLists").addEventListener("click", () => {
  $("maleNames").value = PF_DEFAULTS.maleNames.join("\n");
  $("femaleNames").value = PF_DEFAULTS.femaleNames.join("\n");
  $("lastNames").value = PF_DEFAULTS.lastNames.join("\n");
  $("streets").value = PF_DEFAULTS.streets.join("\n");
});

$("save").addEventListener("click", save);
$("openDemo").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("demo/signup.html") });
});

(async () => {
  fillForm(await PFStorage.getSettings());
  await renderProfiles();
})();
