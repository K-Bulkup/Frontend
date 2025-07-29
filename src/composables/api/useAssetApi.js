import apiClient from "@/plugins/axios";

export const postConnectAccount = async (id, bankName) => {
  return await apiClient.post(
    `http://localhost:8080/api/trainee/assets/account/${id}`,
    {
      bank: bankName,
    },
  );
};
