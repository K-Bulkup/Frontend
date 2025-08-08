import apiClient from "@/plugins/axios";

// 트레이닝 등록
export const createTraining = (trainingFormData) => {
  return apiClient.post("/api/trainer/trainings", trainingFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 내 트레이닝 목록 + 검색
export const getMyTrainings = (keyword = "") => {
  return apiClient.get("/api/trainer/trainings", {
    params: { keyword },
  });
};
