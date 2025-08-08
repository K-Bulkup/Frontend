import apiClient from "@/plugins/axios";

export const getTrainerReviews = async (trainingId) => {
  const response = await apiClient.get(`/api/trainer/reviews/${trainingId}`);
  return response.data;
};
