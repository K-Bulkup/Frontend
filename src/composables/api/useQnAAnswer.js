import apiClient from "@/plugins/axios";

export const postQnAAnswer = (trainingId, qnaId, answer) => {
  return apiClient.post(`/api/trainer/trainings/${trainingId}/answer`, {
    qnaId,
    answer,
  });
};
