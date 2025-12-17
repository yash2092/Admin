import { loadJson, saveJson, storageKey } from './storage';

const ADMIN_SESSION_KEY = storageKey('admin_session');

export function getAdminSession() {
  return loadJson(ADMIN_SESSION_KEY, null);
}

export function isAdminAuthenticated() {
  const session = getAdminSession();
  return Boolean(session && session.isAuthenticated);
}

export function setAdminSession({ email }) {
  saveJson(ADMIN_SESSION_KEY, {
    isAuthenticated: true,
    email: email || null,
    updatedAt: new Date().toISOString(),
  });
}

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}
