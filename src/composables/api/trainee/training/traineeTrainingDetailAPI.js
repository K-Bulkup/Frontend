import apiClient from "@/plugins/axios";

// 트레이닝 상세 조회
export const getTraineeTrainingDetail = (trainingId) => {
  return apiClient.get(`/api/trainee/trainings/running/${trainingId}`);
};

// 트레이닝 리뷰 여부
export const getTraineeTrainingReviewBoolean = (trainingId) => {
  return apiClient.get(`/api/trainee/reviews/${trainingId}`);
};
