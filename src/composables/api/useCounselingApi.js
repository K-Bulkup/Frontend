import apiClient from "@/plugins/axios";
import { awaitUserReady } from "../user/awaitUserReady";

export async function getCounselingList() {
  const userId = await awaitUserReady();
  return await apiClient.get(`/api/common/counselings/${userId}`);
}

export async function getCounselingDetail(roomId, userId) {
  return await apiClient.get(
    `/api/common/counselings/detail/${roomId}/${userId}`,
  );
}

export async function getChatHistory(roomId, userId) {
  return await apiClient.get(`/api/common/chats/${roomId}/${userId}`);
}

export async function readMessages(roomId, userId) {
  return await apiClient.post(`/api/common/chats/read`, {
    roomId,
    userId,
  });
}
