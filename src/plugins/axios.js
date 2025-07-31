import { useAuthStore } from "@/stores/auth";
import router from "@/router";
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080", // 백엔드 서버의 실제 주소로 변경하세요 // .env 파일에 정의된 API 서버 주소
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

export const createTraining = (trainingFormData) => {
  return apiClient.post("/api/trainer/trainings", trainingFormData);
};
