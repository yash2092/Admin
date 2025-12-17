const STORAGE_PREFIX = 'rv_admin_';

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix) {
  // Good-enough unique id for local-only CRUD
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function storageKey(name) {
  return `${STORAGE_PREFIX}${name}`;
}

export function loadJson(key, fallback) {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  return safeJsonParse(raw, fallback);
}

export function saveJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadList(key) {
  const list = loadJson(key, []);
  return Array.isArray(list) ? list : [];
}

export function saveList(key, list) {
  saveJson(key, list);
}

export function upsertById(list, item) {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...list];
  return list.map((x) => (x.id === item.id ? item : x));
}

export function removeById(list, id) {
  return list.filter((x) => x.id !== id);
}

export function withTimestamps(existing, next, { isNew }) {
  const createdAt = isNew ? nowIso() : existing?.createdAt || nowIso();
  const updatedAt = nowIso();
  return { ...next, createdAt, updatedAt };
}

