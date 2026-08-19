const PersonaFake = (() => {
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
  const pad = (n, size) => String(n).padStart(size, "0");
  const slug = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "");

  function randomDate(minAge = 21, maxAge = 55) {
    const now = new Date();
    const max = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
    const min = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());
    const ts = min.getTime() + Math.random() * (max.getTime() - min.getTime());
    const d = new Date(ts);
    return {
      date: d,
      iso: `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`,
      display: `${pad(d.getDate(), 2)}/${pad(d.getMonth() + 1, 2)}/${d.getFullYear()}`
    };
  }

  function randomPassword(length, settings) {
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const nums = "23456789";
    const symbols = settings.passwordSymbols === false ? "" : "!@#$%*?";
    const all = lower + upper + nums + symbols;
    let out = pick(upper.split("")) + pick(lower.split("")) + pick(nums.split(""));
    if (symbols) out += pick(symbols.split(""));
    while (out.length < length) out += pick(all.split(""));
    return out
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("")
      .slice(0, length);
  }

  function formatHandle(first, last, format, extra = "") {
    const a = slug(first);
    const b = slug(last);
    const n = extra || String(Math.floor(10 + Math.random() * 89));
    switch (format) {
      case "namesurname":
        return `${a}${b}${n}`;
      case "initial.surname":
        return `${a[0]}.${b}${n}`;
      case "surname.name":
        return `${b}.${a}${n}`;
      case "name.surname":
      default:
        return `${a}.${b}${n}`;
    }
  }

  function fakeCurp(first, last, secondLast, gender, birth, stateCode = "DF") {
    const l1 = slug(last).charAt(0).toUpperCase() || "X";
    const v1 = (slug(last).match(/[aeiou]/)?.[0] || "X").toUpperCase();
    const l2 = slug(secondLast).charAt(0).toUpperCase() || "X";
    const n1 = slug(first).charAt(0).toUpperCase() || "X";
    const yy = String(birth.getFullYear()).slice(-2);
    const mm = pad(birth.getMonth() + 1, 2);
    const dd = pad(birth.getDate(), 2);
    const sex = gender === "female" ? "M" : "H";
    const cons = "BCDFGHJKLMNPQRSTVWXYZ";
    const extra = pick(cons.split("")) + pick(cons.split("")) + pick(cons.split(""));
    return `${l1}${v1}${l2}${n1}${yy}${mm}${dd}${sex}${stateCode}${extra}${digits(2)}`;
  }

  function fakeRfc(last, secondLast, first, birth) {
    const a = slug(last).slice(0, 2).toUpperCase().padEnd(2, "X");
    const b = slug(secondLast).charAt(0).toUpperCase() || "X";
    const c = slug(first).charAt(0).toUpperCase() || "X";
    const yy = String(birth.getFullYear()).slice(-2);
    const mm = pad(birth.getMonth() + 1, 2);
    const dd = pad(birth.getDate(), 2);
    const homo = pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")) + digits(2);
    return `${a}${b}${c}${yy}${mm}${dd}${homo}`;
  }

  function fakeDni() {
    const num = String(Math.floor(10000000 + Math.random() * 89999999));
    const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
    return `${num}${letters[Number(num) % 23]}`;
  }

  function generate(settings = {}) {
    const cfg = { ...PF_DEFAULTS, ...settings };
    const locale = PF_PLACES[cfg.locale] ? cfg.locale : "mx";
    const place = PF_PLACES[locale];
    const gender =
      cfg.gender === "male" || cfg.gender === "female"
        ? cfg.gender
        : Math.random() < 0.5
          ? "male"
          : "female";

    const maleNames = cfg.maleNames?.length ? cfg.maleNames : PF_DEFAULTS.maleNames;
    const femaleNames = cfg.femaleNames?.length ? cfg.femaleNames : PF_DEFAULTS.femaleNames;
    const lastNames = cfg.lastNames?.length ? cfg.lastNames : PF_DEFAULTS.lastNames;
    const streets = cfg.streets?.length ? cfg.streets : PF_DEFAULTS.streets;
    const domains = cfg.domains?.length ? cfg.domains : PF_DEFAULTS.domains;

    const firstName = pick(gender === "female" ? femaleNames : maleNames);
    let lastName = pick(lastNames);
    let secondLastName = pick(lastNames);
    while (secondLastName === lastName && lastNames.length > 1) {
      secondLastName = pick(lastNames);
    }

    const birth = randomDate();
    const region = pick(place.regions);
    const city = pick(region.cities);
    const streetNumber = 10 + Math.floor(Math.random() * 1890);
    const interior = Math.random() < 0.45 ? ` Int. ${1 + Math.floor(Math.random() * 24)}` : "";
    const street = `${pick(streets)} ${streetNumber}${interior}`;
    const postalCode = digits(place.postalDigits);
    const localPhone = locale === "es" ? `6${digits(8)}` : digits(10);
    const phone = `${place.phonePrefix} ${localPhone}`;
    const username = formatHandle(firstName, lastName, cfg.usernameFormat);
    const emailLocal = formatHandle(firstName, lastName, cfg.emailFormat);
    const email = `${emailLocal}@${pick(domains)}`;
    const password =
      cfg.passwordMode === "random"
        ? randomPassword(Number(cfg.passwordLength) || 12, cfg)
        : cfg.fixedPassword || PF_DEFAULTS.fixedPassword;

    const usesTwoSurnames = ["mx", "es", "ar", "co"].includes(locale);
    const fullName = usesTwoSurnames
      ? `${firstName} ${lastName} ${secondLastName}`
      : `${firstName} ${lastName}`;
    const company = cfg.extra?.company || pick(PF_COMPANIES);
    const jobTitle = cfg.extra?.jobTitle || pick(PF_JOBS);
    const website = cfg.extra?.website || `https://www.${slug(company).replace(/\./g, "")}.test`;

    const curp = fakeCurp(firstName, lastName, secondLastName, gender, birth.date);
    const rfc = fakeRfc(lastName, secondLastName, firstName, birth.date);
    const dni = fakeDni();
    const documentId = locale === "es" ? dni : locale === "mx" ? curp : `ID-${digits(8)}`;

    const custom = {};
    for (const field of cfg.customFields || []) {
      if (!field?.key) continue;
      custom[field.key] = field.mode === "fixed" ? field.value || "" : randomFromTemplate(field.value || "");
    }

    return {
      id: `pf_${Date.now()}_${digits(4)}`,
      locale,
      gender,
      firstName,
      lastName,
      secondLastName,
      fullName,
      username,
      email,
      password,
      phone,
      phoneLocal: localPhone,
      birthDate: birth.iso,
      birthDateDisplay: birth.display,
      age: new Date().getFullYear() - birth.date.getFullYear(),
      street,
      city,
      state: region.state,
      postalCode,
      country: place.country,
      countryCode: place.countryCode,
      address: `${street}, ${city}, ${region.state}, ${postalCode}`,
      company,
      jobTitle,
      website,
      curp,
      rfc,
      dni,
      documentId,
      genderLabel: gender === "female" ? "Mujer" : "Hombre",
      custom,
      createdAt: new Date().toISOString()
    };
  }

  function randomFromTemplate(template) {
    return String(template).replace(/\{(\d+)d\}/g, (_, n) => digits(Number(n)));
  }

  return { generate, slug };
})();
