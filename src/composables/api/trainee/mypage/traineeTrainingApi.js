import apiClient from "@/plugins/axios";

export async function getTraineeTraining() {
  const res = await apiClient.get(`/api/trainee/enrollments`);
  return res.data.data;
}

export async function getTraineeProfile() {
  const res = await apiClient.get(`/api/trainee/profiles/me`);
  return res.data.data;
}
