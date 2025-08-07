import { defineStore } from "pinia";
import apiClient from "@/plugins/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    role: null,
    token: null,
    userId: null,
  }),

  actions: {
    setRole(role) {
      this.role = role;
    },

    setToken(token) {
      this.token = token;
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }
    },

    setUserId(userId) {
      this.userId = userId;
    },

    async fetchUserInfo() {
      if (this.role === 'ADMIN') {
        return; // 관리자 역할이면 API 호출을 건너뜁니다.
      }
      try {
        const res = await apiClient.get("/api/common/users/me");
        const userData = res.data.data;

        this.setUserId(userData.userId);
        this.setRole(userData.roles[0]);
      } catch (e) {
        console.error("유저 정보 가져오기 실패:", e);
      }
    },

    logout() {
      this.role = null;
      this.token = null;
      this.userId = null;
      localStorage.removeItem("accessToken");
    },
  },
});