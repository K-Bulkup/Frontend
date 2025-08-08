import { defineStore } from 'pinia';

export const useEnrollmentStore = defineStore('enrollment', {
  state: () => ({
    enrollmentId: null
  }),

  persist: true // 새로고침 후에도 유지하고 싶다면
});
