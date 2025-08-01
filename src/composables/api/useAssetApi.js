import apiClient from "@/plugins/axios";

export const postConnectAccount = async (bankName) => {
  return await apiClient.post(
    `http://localhost:8080/api/trainee/assets/account`,
    {
      bank: bankName,
    },
  );
};

export const getTraineeAsset = async () => {
  return await apiClient.get(`http://localhost:8080/api/trainee/assets`);
};
