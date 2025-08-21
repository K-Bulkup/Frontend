import apiClient from "@/plugins/axios";

export const submitRoutineResult = async (routineId, payload, file) => {
  const fd = new FormData();

  fd.append(
    "requestDTO",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );
  if (file instanceof File) {
    fd.append("file", file, file.name);
  }

  // 이 요청에서만 JSON 기본 헤더/변환을 무력화
  return apiClient.post(`/api/trainee/routines/${routineId}/results`, fd, {
    headers: { "Content-Type": undefined },
    transformRequest: [
      (data, headers) => {
        if (headers) delete headers["Content-Type"];
        return data;
      },
    ],
  });
};

export const getUserAnswer = async (trainingId, routineId) => {
  // 👉 apiClient 사용
  return apiClient.get(
    `/api/trainee/routines/user-answers/${trainingId}/${routineId}`,
  );
};
