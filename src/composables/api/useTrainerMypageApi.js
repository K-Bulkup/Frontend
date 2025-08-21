import apiClient from "@/plugins/axios";

export const trainerMyPageApi = {
  // 트레이너 정보 조회
  async getTrainerInfo() {
    try {
      const response = await apiClient.get("/api/trainer/profiles/me");
      return response.data;
    } catch (error) {
      console.error("트레이너 정보 조회 실패:", error);
      throw error;
    }
  },

  // 트레이너 소개 업데이트
  async updateIntroduction(career) {
    try {
      const response = await apiClient.put("/api/trainer/profiles/career", {
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
      const response = await apiClient.put(
        "/api/trainer/profiles/profile-image",
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

  async getCertifications(data) {
    try {
      const response = await apiClient.post(
        "/api/trainer/certificates/verification",
        data,
      );
      return response.data;
    } catch (error) {
      console.error("자격증 정보 조회 실패:", error);
      throw error;
    }
  },

  // 수익 리포트 요약 데이터 조회
  async getRevenueReport(trainingId = null) {
    try {
      const url = trainingId
        ? `/api/trainer/mypage/report?trainingId=${trainingId}`
        : "/api/trainer/mypage/report";
      const response = await apiClient.get(url);
      return response.data.data;
    } catch (error) {
      console.error("수익 리포트 요약 데이터 조회 실패:", error);
      throw error;
    }
  },

  // 일별 수익 데이터 조회 (전체)
  async getDailyRevenue() {
    try {
      const response = await apiClient.get("/api/trainer/mypage/report/daily");
      return response.data.data;
    } catch (error) {
      console.error("일별 수익 데이터 조회 실패:", error);
      throw error;
    }
  },

  // 특정 트레이닝의 일별 수익 데이터 조회
  async getTrainingDailyRevenue(trainingId) {
    try {
      const response = await apiClient.get(`/api/trainer/mypage/report/${trainingId}/daily`);
      return response.data.data;
    } catch (error) {
      console.error("특정 트레이닝 일별 수익 데이터 조회 실패:", error);
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
  getRevenueReport,
  getDailyRevenue,
  getTrainingDailyRevenue,
} = trainerMyPageApi;