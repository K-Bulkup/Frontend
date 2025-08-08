import apiClient from "@/plugins/axios";

// ✅ 트레이너가 본인이 개설한 트레이닝 상세 조회 API
export const getTrainerTrainingDetail = (trainingId) => {
  return apiClient.get(`/api/trainer/trainings/${trainingId}`);
};
