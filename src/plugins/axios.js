import { useAuthStore } from "@/stores/auth";
import router from "@/router";
import axios from "axios";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? "http://43.201.172.152:8080"
      : "http://localhost:8080"),
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore();
    const res = error.response;
    if (
      res &&
      res.status === 401 &&
      res.data?.name === "AUTH_TOKEN_INVALID_OR_EXPIRED"
    ) {
      authStore.logout();
      router.push("/login");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
