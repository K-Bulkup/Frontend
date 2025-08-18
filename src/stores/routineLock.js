import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useEnrollmentStore } from "@/stores/enrollment";

const STORAGE_KEY = "kbulkup:routineLock:v2";

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

function scopedKey({ userId, trainingId, enrollmentId, routineId }) {
  const u = String(userId ?? "anon");
  const t =
    enrollmentId != null
      ? `enr:${enrollmentId}`
      : trainingId != null
        ? `tr:${trainingId}`
        : "tr:na";
  const r = String(routineId ?? "");
  return `${u}::${t}::${r}`;
}

export const useRoutineLockStore = defineStore("routineLock", {
  state: () => ({
    lockedByKey: load(),
  }),
  actions: {
    _save() {
      save(this.lockedByKey);
    },
    _ctx(ctx = {}) {
      const auth = useAuthStore();
      const enroll = useEnrollmentStore();
      return {
        userId: ctx.userId ?? auth?.userId ?? auth?.user?.userId ?? "anon",
        trainingId: ctx.trainingId ?? null,
        enrollmentId: ctx.enrollmentId ?? enroll?.enrollmentId ?? null,
        routineId: ctx.routineId,
      };
    },
    lock(ctx) {
      const k = scopedKey(this._ctx(ctx));
      this.lockedByKey[k] = true;
      this._save();
    },
    unlock(ctx) {
      const k = scopedKey(this._ctx(ctx));
      delete this.lockedByKey[k];
      this._save();
    },
    isLocked(ctx) {
      const k = scopedKey(this._ctx(ctx));
      return !!this.lockedByKey[k];
    },
    clearAllForUser(userId) {
      const prefix = `${userId}::`;
      for (const k of Object.keys(this.lockedByKey)) {
        if (k.startsWith(prefix)) delete this.lockedByKey[k];
      }
      this._save();
    },
    clearAll() {
      this.lockedByKey = {};
      this._save();
    },
  },
});
