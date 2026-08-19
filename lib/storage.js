const PFStorage = {
  keys: {
    settings: "pf_settings",
    identity: "pf_identity",
    profiles: "pf_profiles"
  },

  async getSettings() {
    const data = await chrome.storage.local.get(this.keys.settings);
    return { ...PF_DEFAULTS, ...(data[this.keys.settings] || {}) };
  },

  async saveSettings(settings) {
    const current = await this.getSettings();
    const next = { ...current, ...settings };
    await chrome.storage.local.set({ [this.keys.settings]: next });
    return next;
  },

  async getIdentity() {
    const data = await chrome.storage.local.get(this.keys.identity);
    return data[this.keys.identity] || null;
  },

  async saveIdentity(identity) {
    await chrome.storage.local.set({ [this.keys.identity]: identity });
    return identity;
  },

  async getOrCreateIdentity() {
    const existing = await this.getIdentity();
    if (existing) return existing;
    const settings = await this.getSettings();
    const identity = PersonaFake.generate(settings);
    await this.saveIdentity(identity);
    return identity;
  },

  async newIdentity() {
    const settings = await this.getSettings();
    const identity = PersonaFake.generate(settings);
    await this.saveIdentity(identity);
    return identity;
  },

  async getProfiles() {
    const data = await chrome.storage.local.get(this.keys.profiles);
    return data[this.keys.profiles] || [];
  },

  async saveProfile(name, identity) {
    const profiles = await this.getProfiles();
    const profile = {
      id: identity.id || `pf_${Date.now()}`,
      name: name || identity.fullName,
      identity,
      savedAt: new Date().toISOString()
    };
    const next = [profile, ...profiles.filter((p) => p.id !== profile.id)].slice(0, 30);
    await chrome.storage.local.set({ [this.keys.profiles]: next });
    return next;
  },

  async deleteProfile(id) {
    const profiles = await this.getProfiles();
    const next = profiles.filter((p) => p.id !== id);
    await chrome.storage.local.set({ [this.keys.profiles]: next });
    return next;
  }
};
