import apiClient from "@/plugins/axios";

export const getTraineeReview = async (trainingId) => {
  return await apiClient.get(
    `http://localhost:8080/api/trainee/trainings/reviews/${trainingId}`,
  );
};

export const submitTraineeReview = async (trainingId, reviewData) => {
  return await apiClient.post(
    `http://localhost:8080/api/trainee/trainings/reviews/${trainingId}`,
    reviewData,
  );
};
