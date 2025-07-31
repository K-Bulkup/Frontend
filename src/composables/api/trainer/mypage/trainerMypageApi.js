import apiClient from "@/plugins/axios";

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 리다이렉트
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const trainerMyPageApi = {
  // 트레이너 정보 조회
  async getTrainerInfo() {
    try {
      const response = await apiClient.get("/api/trainer/profiles/me/1");
      return response.data;
    } catch (error) {
      console.error("트레이너 정보 조회 실패:", error);
      throw error;
    }
  },

  // 트레이너 소개 업데이트
  async updateIntroduction(career) {
    try {
      const response = await apiClient.put("/api/trainer/profiles/career/1", {
        career,
      });
      return response.data;
    } catch (error) {
      console.error("소개 업데이트 실패:", error);
      throw error;
    }
  },

  // 프로필 이미지 업로드
  async uploadProfileImage(formData) {
    try {
      const response = await apiClient.post(
        "/trainer/profile-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
      throw error;
    }
  },

  // 자격증 정보 조회
  async getCertifications() {
    try {
      const response = await apiClient.get("/trainer/certifications");
      return response.data;
    } catch (error) {
      console.error("자격증 정보 조회 실패:", error);
      throw error;
    }
  },

  // 트레이너 통계 조회
  async getTrainerStats() {
    try {
      const response = await apiClient.get("/trainer/stats");
      return response.data;
    } catch (error) {
      console.error("트레이너 통계 조회 실패:", error);
      throw error;
    }
  },
};

// 개별 함수들도 export (필요한 경우)
export const {
  getTrainerInfo,
  updateIntroduction,
  uploadProfileImage,
  getCertifications,
  getTrainerStats,
} = trainerMyPageApi;
