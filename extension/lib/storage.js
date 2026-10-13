// Tiny storage wrapper. Uses chrome.storage.local inside the extension and
// falls back to localStorage when the panel is previewed as a plain web page.
const hasChromeStorage =
  typeof chrome !== "undefined" && !!chrome.storage && !!chrome.storage.local;

export const store = {
  async get(key, fallback = null) {
    if (hasChromeStorage) {
      const out = await chrome.storage.local.get(key);
      return out[key] === undefined ? fallback : out[key];
    }
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  async set(key, value) {
    if (hasChromeStorage) return chrome.storage.local.set({ [key]: value });
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  async remove(key) {
    if (hasChromeStorage) return chrome.storage.local.remove(key);
    try {
      localStorage.removeItem(key);
    } catch {}
  },
  async clear() {
    if (hasChromeStorage) return chrome.storage.local.clear();
    try {
      localStorage.clear();
    } catch {}
  },
};
