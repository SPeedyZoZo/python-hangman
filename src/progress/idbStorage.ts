import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

/** IndexedDB-backed storage for zustand persist, falling back to localStorage (ADR-0005). */
export const idbStorage: StateStorage = {
  async getItem(name) {
    try {
      return (await get<string>(name)) ?? null;
    } catch {
      return globalThis.localStorage?.getItem(name) ?? null;
    }
  },
  async setItem(name, value) {
    try {
      await set(name, value);
    } catch {
      globalThis.localStorage?.setItem(name, value);
    }
  },
  async removeItem(name) {
    try {
      await del(name);
    } catch {
      globalThis.localStorage?.removeItem(name);
    }
  },
};
