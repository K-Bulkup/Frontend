import apiClient from "@/plugins/axios";

// 트레이너 기존 스케줄 조회
export const getTrainerSchedules = async () => {
  return await apiClient.get("/api/schedules/trainer");
};

export const getTrainerSchedulesByTrainerId = async (trainerId) => {
  return await apiClient.get(`/api/schedules/trainee/${trainerId}`);
};

export const getTrainerReservationByTrainerId = async (trainerId) => {
  return await apiClient.get(`/api/reservations/trainee/${trainerId}`);
};

// 트레이너 컨설팅 가능 시간 등록
export const createTrainerSchedules = async (timeSlots) => {
  return await apiClient.post("/api/schedules/trainer", { timeSlots });
};

// 트레이너 예약 목록 조회
export const getTrainerReservation = async () => {
  return await apiClient.get("/api/reservations/trainer");
};

// 트레이니 예약 목록 조회
export const getTraineeReservation = async () => {
  return await apiClient.get("/api/reservations/trainee");
};

// 트레이니 예약 생성
export const createTraineeReservation = async (payload) => {
  return await apiClient.post("/api/reservations/trainee", payload);
};
