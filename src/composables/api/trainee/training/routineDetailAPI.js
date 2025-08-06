import apiClient from "@/plugins/axios";

// 루틴 상세 조회
export const getRoutineDetail = (routineId) => {
  return apiClient.get(`/api/trainee/routines/${routineId}`);
};
