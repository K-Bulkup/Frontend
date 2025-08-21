import apiClient from "@/plugins/axios";

// 트레이닝 상세 조회 (옵션으로 enrollmentId 전달 가능)
export const getTraineeTrainingDetail = (trainingId, opts) => {
  const url = `/api/trainee/trainings/running/${trainingId}`;
  if (opts && Number.isFinite(Number(opts.enrollmentId))) {
    return apiClient.get(url, {
      params: { enrollmentId: Number(opts.enrollmentId) },
    });
  }
  return apiClient.get(url);
};

// 트레이닝 리뷰 여부
export const getTraineeTrainingStatus = (trainingId) => {
  return apiClient.get(`/api/trainee/training/${trainingId}/status`);
};
