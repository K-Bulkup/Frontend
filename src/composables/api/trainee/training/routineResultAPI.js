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
    // 1) 기본 'application/json' 헤더 제거
    headers: { "Content-Type": undefined },
    // 2) 혹시 전역 transformRequest가 JSON.stringify 한다면 무력화
    transformRequest: [
      (data, headers) => {
        // axios가 보낼 헤더에서 Content-Type 완전히 삭제 → 브라우저가 boundary 포함해서 자동 세팅
        if (headers) delete headers["Content-Type"];
        return data;
      },
    ],
  });
};
