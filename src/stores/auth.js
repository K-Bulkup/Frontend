import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    role: null,
    token: null,
  }),

  actions: {
    setRole(role) {
      this.role = role;
    },

    setToken(token) {
      this.token = token;
    },

    async fetchUserInfo() {
      // try {
      //   const res = await axios.get("/api/common/users/me", {
      //     headers: { Authorization: `Bearer ${this.token}` },
      //   });
      //   this.setRole(res.data.role);
      // } catch (e) {
      //   console.error("유저 정보 가져오기 실패:", e);
      // }
      this.setRole("trainer");
    },

    logout() {
      this.role = null;
      this.token = null;
      localStorage.removeItem("accessToken");
    },
  },
});
