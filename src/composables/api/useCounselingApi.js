import apiClient from "@/plugins/axios";

export async function getCounselingList() {
  return await apiClient.get("/api/common/counselings");
}

export async function getCounselingDetail(roomId) {
  return await apiClient.get(`/api/common/counselings/detail/${roomId}`);
}

export async function getChatHistory(roomId) {
  return await apiClient.get(`/api/common/chats/${roomId}`);
}

export async function readMessages(roomId, userId) {
  return await apiClient.post(`/api/common/chats/read`, {
    roomId,
    userId,
  });
}
