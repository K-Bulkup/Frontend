import apiClient from "@/plugins/axios";

// 트레이닝 등록
export const createTraining = (trainingFormData) => {
  return apiClient.post("/api/trainer/trainings", trainingFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
