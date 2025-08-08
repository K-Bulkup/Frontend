import apiClient from "@/plugins/axios";

export const getReviews = async (trainingId) => {
  const response = await apiClient.get(`/api/common/reviews/${trainingId}`);
  return response.data;
};
