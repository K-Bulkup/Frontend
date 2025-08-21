import apiClient from "@/plugins/axios";

// 루틴 상세 조회 (옵션으로 enrollmentId 전달 가능)
export const getRoutineDetail = (routineId, opts) => {
  const url = `/api/trainee/routines/${routineId}`;
  if (opts && Number.isFinite(Number(opts.enrollmentId))) {
    return apiClient.get(url, { params: { enrollmentId: Number(opts.enrollmentId) } });
  }
  return apiClient.get(url);
};
