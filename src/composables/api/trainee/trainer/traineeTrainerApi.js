import apiClient from "@/plugins/axios";

export const traineeTrainerApi = {
  // 트레이너 기본 정보 조회 (강의 포함)
  async getTrainerInfo(trainerId) {
    return await apiClient.get(`/api/trainee/trainers/${trainerId}`);
  },

  // 트레이너 프로필 조회
  async getTrainerProfileById(trainerId) {
    try {
      const response = await apiClient.get(
        `/api/trainer/profiles/${trainerId}`,
      );
      return response.data;
    } catch (error) {
      console.error(`트레이너 ID ${trainerId}의 프로필 조회 실패:`, error);
      throw error;
    }
  },
};
