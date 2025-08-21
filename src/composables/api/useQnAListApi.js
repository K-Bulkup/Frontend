import apiClient from "@/plugins/axios";

export const getTrainingQnAListDetail = (trainingId) => {
  return apiClient.get(`/api/common/trainings/${trainingId}/qnas`);
};
