import apiClient from "@/plugins/axios";

// 전체 트레이닝 목록 조회
export const getAllTrainings = async () => {
  return await apiClient.get("/api/trainee/trainings/training");
};

// 검색 API
export const searchTrainings = async (keyword) => {
  return await apiClient.get("/api/trainings/search", {
    params: { keyword }
  });
};
