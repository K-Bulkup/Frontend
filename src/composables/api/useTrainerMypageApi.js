import apiClient from "@/plugins/axios";

export const trainerMyPageApi = {
  // 트레이너 정보 조회
  async getTrainerInfo() {
    try {
      const response = await apiClient.get("/api/trainer/profiles/me");
      return response.data;
    } catch (error) {
      console.error("트레이너 정보 조회 실패:", error);
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
    }
  },
};

// 개별 함수들도 export (필요한 경우)
export const {
  getTrainerInfo,
  updateIntroduction,
  uploadProfileImage,
  getCertifications,
} = trainerMyPageApi;
