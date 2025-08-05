import apiClient from "@/plugins/axios";

export async function requestAiConsulting(question, isAsset = false) {
  const res = await apiClient.post("api/gpt/consulting", { question, isAsset });

  return res.data.data;
}

export async function getAiChatHistory() {
  return await apiClient.get("/api/common/chats/ai");
}
