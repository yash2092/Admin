import { loadJson, saveJson, storageKey } from './storage';

/**
 * Admin "authentication" utilities.
 *
 * IMPORTANT:
 * - This is NOT real authentication.
 * - It is a temporary local session flag to gate the admin routes in the UI.
 *
 * WHY we still do it:
 * - To simulate a real admin app workflow until an API is connected.
 * - To keep navigation/route protection logic in one place.
 */

const ADMIN_SESSION_STORAGE_KEY = storageKey('admin_session');

/**
 * Load the admin session object from `localStorage`.
 */
export function getAdminSession() {
  const fallbackSession = null;
  return loadJson(ADMIN_SESSION_STORAGE_KEY, fallbackSession);
}

/**
 * Check whether the current browser has an active admin session.
 */
export function isAdminAuthenticated() {
  const session = getAdminSession();

  // Be defensive: old or malformed storage values should not crash the app.
  if (!session || typeof session !== 'object') {
    return false;
  }

  return Boolean(session.isAuthenticated);
}

/**
 * Create/update the admin session.
 *
 * WHY we store `updatedAt`:
 * - Helpful for debugging.
 * - In the future, we could expire sessions based on age.
 */
export function setAdminSession(params) {
  const emailFromParams = params ? params.email : null;

  const nextSession = {
    isAuthenticated: true,
    email: emailFromParams || null,
    updatedAt: new Date().toISOString(),
  };

  saveJson(ADMIN_SESSION_STORAGE_KEY, nextSession);
}

/**
 * Clear the session so protected routes redirect back to login.
 */
export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}
