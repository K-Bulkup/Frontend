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
      localStorage.setItem("accessToken", token); // 이 줄을 추가합니다.
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
      this.setRole("trainee");
    },

    logout() {
      this.role = null;
      this.token = null;
      localStorage.removeItem("accessToken");
    },
  },
});
