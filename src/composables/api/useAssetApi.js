import apiClient from "@/plugins/axios";

export const postConnectAccount = async (bankName) => {
  return await apiClient.post(`/api/trainee/assets/account`, {
    bank: bankName,
  });
};

export const getTraineeAsset = async () => {
  return await apiClient.get(`/api/trainee/assets`);
};

export async function getTraineeAssetByRoomId(roomId) {
  const res = await apiClient.get(
    `/api/trainee/assets/trainer-share/${roomId}`,
  );

  return res.data;
}
