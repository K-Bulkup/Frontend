import apiClient from "@/plugins/axios";

export async function requestAiConsulting(question) {
  const res = await apiClient.post("api/gpt/consulting", null, {
    params: { question },
  });

  return res.data.data;
}

export async function getAiChatHistory() {
  return await apiClient.get("/api/common/chats/ai");
}
