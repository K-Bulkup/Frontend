// 📌 결제 요청 API
import apiClient from "@/plugins/axios";

export const traineeTrainingPayment = async (paymentData) => {
  return await apiClient.post("/api/trainee/trainings/payment", paymentData);
};
