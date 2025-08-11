import apiClient from "@/plugins/axios";

// 트레이닝 상세 조회 (옵션으로 enrollmentId 전달 가능)
export const getTraineeTrainingDetail = (trainingId, opts) => {
  const url = `/api/trainee/trainings/running/${trainingId}`;
  if (opts && Number.isFinite(Number(opts.enrollmentId))) {
    return apiClient.get(url, { params: { enrollmentId: Number(opts.enrollmentId) } });
  }
  return apiClient.get(url);
};

// 트레이닝 리뷰 여부 (그대로)
export const getTraineeTrainingReviewBoolean = (trainingId) => {
  return apiClient.get(`/api/trainee/reviews/${trainingId}`);
};
