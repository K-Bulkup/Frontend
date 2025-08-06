import apiClient from "@/plugins/axios";

export const getTraineeTrainingPreDetail = async (trainingId) => {
  return await apiClient.get(`/api/trainee/trainings/${trainingId}`);
};