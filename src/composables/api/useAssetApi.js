import apiClient from "@/plugins/axios";

export const postConnectAccount = async (id, bankName) => {
  return await apiClient.post(`/api/trainee/assets/${id}`, {
    bank: bankName,
  });
};
