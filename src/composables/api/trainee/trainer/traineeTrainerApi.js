import apiClient from "@/plugins/axios";

export const traineeTrainerApi = {
  // 트레이너 상세(프로필 + 운영 중 트레이닝)
  async getTrainerInfo(trainerId) {
    return await apiClient.get(`/api/trainee/trainers/${trainerId}`);
  },

  // (옵션) 단일 프로필만 필요할 때
  async getTrainerProfileById(trainerId) {
    const response = await apiClient.get(`/api/trainer/profiles/${trainerId}`);
    return response.data;
  },
};
