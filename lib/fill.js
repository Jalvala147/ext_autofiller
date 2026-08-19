const PFFill = (() => {
  const TYPE_PATTERNS = {
    email: /(e-?mail|correo|mailaddress)/i,
    username: /(user.?name|usuario|login|nickname|user_?id|account.?name)/i,
    passwordConfirm: /(confirm|repeat|retype|verificar|confirmar|password2|pass2|pwd2)/i,
    password: /(password|passwd|passcode|contrase[nñ]a|pwd|secret)/i,
    firstName: /(first.?name|given.?name|nombre(?!.*(completo|usuario|empresa|compa))|fname|forename)/i,
    secondLastName: /(second.?last|apellido.?materno|apellido.?2|maternal)/i,
    surnames: /(apellidos|last.?names)/i,
    lastName: /(last.?name|family.?name|surname|apellido.?paterno|apellido|lname)/i,
    fullName: /(full.?name|nombre.?completo|display.?name|^name$|your.?name)/i,
    phone: /(phone|tel|celular|mobile|whatsapp|tel[eé]fono|cell)/i,
    birthDate: /(birth|dob|fecha.?nac|birthday|bday|date.?of.?birth|nacimiento)/i,
    street: /(street|calle|address.?line.?1|addr1|direcci[oó]n|address1|address$)/i,
    city: /(city|ciudad|town|localidad)/i,
    state: /(state|estado|province|provincia|region|departamento)/i,
    postalCode: /(zip|postal|c\.?p\.?|codigo.?postal|postcode|post.?code)/i,
    country: /(country|pa[ií]s|nation)/i,
    company: /(company|empresa|organization|organizaci[oó]n|business)/i,
    jobTitle: /(job.?title|title|cargo|puesto|ocupaci[oó]n|profession)/i,
    website: /(website|web.?site|\burl\b|homepage|p[aá]gina.?web)/i,
    curp: /\bcurp\b/i,
    rfc: /\brfc\b/i,
    dni: /\bdni\b|\bnie\b/i,
    documentId: /(document|identificaci[oó]n|id.?number|numero.?id|passport|pasaporte|ine|cedula|c[eé]dula)/i,
    gender: /(gender|sexo|g[eé]nero|sex)/i,
    age: /(^age$|edad)/i
  };

  const AUTOCOMPLETE_MAP = {
    email: "email",
    "username": "username",
    "current-password": "password",
    "new-password": "password",
    "given-name": "firstName",
    "family-name": "lastName",
    "additional-name": "secondLastName",
    name: "fullName",
    tel: "phone",
    "tel-national": "phoneLocal",
    "street-address": "street",
    "address-line1": "street",
    "address-level2": "city",
    "address-level1": "state",
    "postal-code": "postalCode",
    country: "country",
    "country-name": "country",
    organization: "company",
    "organization-title": "jobTitle",
    bday: "birthDate",
    "bday-year": "birthYear",
    url: "website",
    sex: "gender"
  };

  function haystack(el) {
    const id = el.id || "";
    const labelledBy = el.getAttribute("aria-labelledby");
    let labelled = "";
    if (labelledBy) {
      labelled = labelledBy
        .split(/\s+/)
        .map((token) => document.getElementById(token)?.innerText || "")
        .join(" ");
    }
    const label =
      el.closest("label")?.innerText ||
      (id ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.innerText : "") ||
      "";
    return [
      el.name,
      el.id,
      el.placeholder,
      el.title,
      el.getAttribute("aria-label"),
      el.getAttribute("autocomplete"),
      el.dataset.testid,
      el.dataset.qa,
      labelled,
      label
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function nativeSet(el, value) {
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    desc?.set?.call(el, value);
    el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
  }

  function fillSelect(el, value) {
    const wanted = String(value).toLowerCase();
    const options = [...el.options];
    const match =
      options.find((o) => o.value.toLowerCase() === wanted) ||
      options.find((o) => o.text.toLowerCase() === wanted) ||
      options.find((o) => o.value.toLowerCase().includes(wanted) || o.text.toLowerCase().includes(wanted));
    if (!match) return false;
    el.value = match.value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function fillCheckboxOrRadio(nodes, value) {
    const wanted = String(value).toLowerCase();
    let filled = false;
    for (const node of nodes) {
      const text = haystack(node);
      const hit =
        text.includes(wanted) ||
        node.value.toLowerCase() === wanted ||
        (wanted === "female" && /(mujer|female|f\b|mujer|femenino)/i.test(text + node.value)) ||
        (wanted === "male" && /(hombre|male|m\b|masculino)/i.test(text + node.value));
      if (hit) {
        if (!node.checked) node.click();
        filled = true;
      }
    }
    return filled;
  }

  function identityValue(identity, type) {
    const map = {
      email: identity.email,
      username: identity.username,
      password: identity.password,
      passwordConfirm: identity.password,
      firstName: identity.firstName,
      lastName: identity.lastName,
      surnames: `${identity.lastName} ${identity.secondLastName}`.trim(),
      secondLastName: identity.secondLastName,
      fullName: identity.fullName,
      phone: identity.phone,
      phoneLocal: identity.phoneLocal,
      birthDate: identity.birthDate,
      birthYear: identity.birthDate?.slice(0, 4),
      street: identity.street,
      city: identity.city,
      state: identity.state,
      postalCode: identity.postalCode,
      country: identity.country,
      company: identity.company,
      jobTitle: identity.jobTitle,
      website: identity.website,
      curp: identity.curp,
      rfc: identity.rfc,
      dni: identity.dni,
      documentId: identity.documentId,
      gender: identity.gender,
      age: String(identity.age)
    };
    return map[type];
  }

  function detectType(el) {
    if (el.disabled || el.readOnly || el.type === "hidden" || el.type === "submit" || el.type === "button" || el.type === "file") {
      return null;
    }
    const ac = (el.getAttribute("autocomplete") || "").toLowerCase().split(" ").pop();
    if (ac && AUTOCOMPLETE_MAP[ac]) {
      if (ac === "current-password" || ac === "new-password") {
        return /confirm|repeat|retype|verificar|confirmar/i.test(haystack(el)) ? "passwordConfirm" : "password";
      }
      return AUTOCOMPLETE_MAP[ac];
    }
    if (el.type === "email") return "email";
    if (el.type === "password") {
      return TYPE_PATTERNS.passwordConfirm.test(haystack(el)) ? "passwordConfirm" : "password";
    }
    if (el.type === "tel") return "phone";
    if (el.type === "url") return "website";
    if (el.type === "date") return "birthDate";

    const text = haystack(el);
    for (const [type, pattern] of Object.entries(TYPE_PATTERNS)) {
      if (pattern.test(text)) return type;
    }

    return null;
  }

  function customValue(identity, el) {
    const text = haystack(el);
    for (const [key, value] of Object.entries(identity.custom || {})) {
      const needle = key.toLowerCase();
      if (text.includes(needle) || (el.name || "").toLowerCase() === needle || (el.id || "").toLowerCase() === needle) {
        return value;
      }
    }
    return null;
  }

  function fillElement(el, identity, overwrite) {
    if (!overwrite && String(el.value || "").trim()) return false;
    const type = detectType(el);
    let value = null;
    if (type === "custom" || customValue(identity, el)) {
      value = customValue(identity, el);
    } else if (type) {
      value = identityValue(identity, type);
    }
    if (value == null || value === "") return false;

    if (el.tagName === "SELECT") {
      if (type === "gender") {
        return fillSelect(el, identity.gender) || fillSelect(el, identity.genderLabel) || fillSelect(el, identity.gender === "female" ? "F" : "M");
      }
      return fillSelect(el, value);
    }

    if (el.type === "radio" || el.type === "checkbox") {
      if (type === "gender") return fillCheckboxOrRadio([el], identity.gender);
      return false;
    }

    if (el.type === "date") {
      nativeSet(el, identity.birthDate);
      return true;
    }

    nativeSet(el, String(value));
    return true;
  }

  function collectFields(root = document) {
    return [...root.querySelectorAll("input, textarea, select")].filter((el) => {
      if (el.closest('[aria-hidden="true"]')) return false;
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  }

  function fillForm(identity, options = {}) {
    const overwrite = options.overwrite !== false;
    const root = options.root || document;
    const fields = collectFields(root);
    let filled = 0;
    const used = [];

    const radios = {};
    for (const el of fields) {
      if (el.type === "radio") {
        const key = el.name || haystack(el);
        radios[key] = radios[key] || [];
        radios[key].push(el);
        continue;
      }
      if (fillElement(el, identity, overwrite)) {
        filled += 1;
        used.push(el.name || el.id || detectType(el));
      }
    }

    for (const group of Object.values(radios)) {
      const genderGroup = group.some((el) => detectType(el) === "gender");
      if (genderGroup && fillCheckboxOrRadio(group, identity.gender)) {
        filled += 1;
        used.push("gender");
      }
    }

    return { filled, total: fields.length, used };
  }

  function fillActiveField(identity) {
    const el = document.activeElement;
    if (!el || !["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) {
      return { filled: 0, reason: "no-active-field" };
    }
    const ok = fillElement(el, identity, true);
    return { filled: ok ? 1 : 0 };
  }

  return { fillForm, fillActiveField, detectType, collectFields };
})();
