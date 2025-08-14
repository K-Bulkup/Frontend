import apiClient from "@/plugins/axios";

// ✅ 트레이너가 개설한 트레이닝 상세 조회 API
export const getTrainerTrainingDetail = (trainingId) => {
  return apiClient.get(`/api/common/trainings/${trainingId}`);
};

// ✅ 트레이너 트레이닝 상세 루틴 목록 조회 (flat list)
export const getTrainerTrainingRoutines = (trainingId) => {
  return apiClient.get(`/api/trainer/trainings/${trainingId}/routines`);
};
