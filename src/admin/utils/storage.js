/**
 * Storage utilities for "local-only" admin CRUD pages.
 *
 * WHY this file exists:
 * - The admin UI is currently backed by `localStorage` (no API yet).
 * - We centralize key naming, JSON safety, and list operations so the pages remain simple.
 */

/**
 * Prefix all keys to avoid collisions with other apps on the same domain.
 */
const STORAGE_PREFIX = 'rv_admin_';

/**
 * Parse JSON safely.
 *
 * WHY:
 * - `localStorage` can contain corrupted/old values (manual edits, old deployments).
 * - The UI should not crash if parsing fails; it should gracefully fall back.
 */
function parseJsonSafely(rawString, fallbackValue) {
  try {
    return JSON.parse(rawString);
  } catch {
    return fallbackValue;
  }
}

/**
 * Current timestamp in ISO format.
 *
 * WHY:
 * - ISO strings are sortable and easy to display consistently later.
 */
function getCurrentIsoTimestamp() {
  return new Date().toISOString();
}

/**
 * Create a stable-ish unique id for local-only records.
 *
 * WHY this approach:
 * - There is no backend UUID generator yet.
 * - We just need "good enough" uniqueness for a single browser profile.
 */
export function makeId(prefix) {
  const prefixPart = String(prefix || 'id');

  // `Date.now()` gives an increasing value that is useful for debugging and ordering.
  const timePartBase36 = Date.now().toString(36);

  // `Math.random()` reduces collision risk when multiple ids are created quickly.
  const randomPartBase36 = Math.random().toString(36);
  const randomPartTrimmed = randomPartBase36.slice(2, 8);

  return `${prefixPart}_${timePartBase36}_${randomPartTrimmed}`;
}

/**
 * Build a namespaced storage key.
 */
export function storageKey(name) {
  const namePart = String(name || '');
  return `${STORAGE_PREFIX}${namePart}`;
}

/**
 * Load JSON from storage and validate it to a usable JS value.
 */
export function loadJson(key, fallbackValue) {
  const storageKeyName = String(key || '');
  const rawValue = window.localStorage.getItem(storageKeyName);

  // WHY:
  // - Missing key should behave the same as "empty" rather than crashing consumers.
  if (rawValue == null || rawValue === '') {
    return fallbackValue;
  }

  return parseJsonSafely(rawValue, fallbackValue);
}

/**
 * Save a JS value as JSON.
 */
export function saveJson(key, value) {
  const storageKeyName = String(key || '');
  const jsonString = JSON.stringify(value);
  window.localStorage.setItem(storageKeyName, jsonString);
}

/**
 * Load an array from storage. If the stored value is not an array, return an empty array.
 */
export function loadList(key) {
  const fallbackList = [];
  const loadedValue = loadJson(key, fallbackList);

  if (Array.isArray(loadedValue)) {
    return loadedValue;
  }

  return [];
}

/**
 * Save an array to storage.
 */
export function saveList(key, list) {
  saveJson(key, list);
}

/**
 * Insert or update a record in a list by `id`.
 *
 * WHY:
 * - CRUD pages want a predictable "save" behavior:
 *   - If it's new, add it to the top.
 *   - If it exists, replace that record in-place (keeping list order stable).
 */
export function upsertById(list, item) {
  const existingList = Array.isArray(list) ? list : [];
  const nextItem = item;

  const existingIndex = existingList.findIndex((currentItem) => currentItem.id === nextItem.id);

  if (existingIndex === -1) {
    // New record: show most recent first.
    return [nextItem, ...existingList];
  }

  // Existing record: replace only the matching element.
  return existingList.map((currentItem) => {
    if (currentItem.id === nextItem.id) {
      return nextItem;
    }
    return currentItem;
  });
}

/**
 * Remove an item from a list by `id`.
 */
export function removeById(list, id) {
  const existingList = Array.isArray(list) ? list : [];
  return existingList.filter((currentItem) => currentItem.id !== id);
}

/**
 * Add `createdAt`/`updatedAt` fields to a record.
 *
 * WHY:
 * - Lists display created dates.
 * - When editing, we preserve `createdAt` but always refresh `updatedAt`.
 */
export function withTimestamps(existingRecord, nextRecord, options) {
  const isNewRecord = Boolean(options && options.isNew);

  let createdAt;
  if (isNewRecord) {
    createdAt = getCurrentIsoTimestamp();
  } else if (existingRecord && existingRecord.createdAt) {
    createdAt = existingRecord.createdAt;
  } else {
    // If we are "editing" something that has no createdAt (old data), generate one.
    createdAt = getCurrentIsoTimestamp();
  }

  const updatedAt = getCurrentIsoTimestamp();

  // We intentionally return a new object to keep React state updates predictable.
  return {
    ...nextRecord,
    createdAt,
    updatedAt,
  };
}

