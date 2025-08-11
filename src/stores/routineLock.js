// src/stores/routineLock.js
import { defineStore } from "pinia";

const STORAGE_KEY = "kbulkup:routineLock:v1";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export const useRoutineLockStore = defineStore("routineLock", {
  state: () => ({
    // key: routineId(string), value: true
    lockedByRoutineId: load(),
  }),
  actions: {
    _save() {
      save(this.lockedByRoutineId);
    },
    lock(id) {
      this.lockedByRoutineId[String(id)] = true;
      this._save();
    },
    unlock(id) {
      delete this.lockedByRoutineId[String(id)];
      this._save();
    },
    isLocked(id) {
      return !!this.lockedByRoutineId[String(id)];
    },
    clearAll() {
      this.lockedByRoutineId = {};
      this._save();
    },
  },
});
