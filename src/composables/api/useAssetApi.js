import apiClient from "@/plugins/axios";

export const postConnectAccount = async (bankName, accountNumber) => {
  return await apiClient.post(`/api/trainee/assets/account`, {
    bank: bankName,
    accountNumber: accountNumber,
  });
};

export const getTraineeAsset = async () => {
  return await apiClient.get(`/api/trainee/assets`);
};

export const updateAndGetTraineeAsset = async () => {
  return await apiClient.put(`/api/trainee/assets`);
};

export async function getTraineeAssetByRoomId(roomId) {
  const res = await apiClient.get(
    `/api/trainee/assets/trainer-share/${roomId}`,
  );

  return res.data;
}
