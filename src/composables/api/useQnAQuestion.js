import apiClient from "@/plugins/axios";

export const postQnAQuestion = (trainingId, questionTitle, question) => {
  return apiClient.post(`/api/trainee/trainings/${trainingId}/question`, {
    questionTitle,
    question,
  });
};
