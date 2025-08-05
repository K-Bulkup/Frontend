import apiClient from "@/plugins/axios";

export const getTraineeReview = async (trainingId) => {
  return await apiClient.get(`/api/trainee/trainings/reviews/${trainingId}`);
};

export const submitTraineeReview = async (trainingId, reviewData) => {
  return await apiClient.post(
    `/api/trainee/trainings/reviews/${trainingId}`,
    reviewData,
  );
};
