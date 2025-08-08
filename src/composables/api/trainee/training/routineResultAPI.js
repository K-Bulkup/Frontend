import apiClient from "@/plugins/axios";

export const submitRoutineResult = async (routineId, payload) => {
  return await apiClient.post(`/api/trainee/routines/${routineId}/results`, payload);
};
