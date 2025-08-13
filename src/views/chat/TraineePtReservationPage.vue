<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";

import BaseButton from "@/components/common/BaseButton.vue";
import DateTimeSlotsPicker from "@/components/chat/DateTimeSlotsPicker.vue";

import {
  getTrainerSchedulesByTrainerId,
  createTraineeReservation, // ✅ 추가 API 사용
} from "@/composables/api/usePtApi";

const route = useRoute();
const TRAINER_ID = Number(route.params.trainerId ?? 22);
const TRAINING_ID = Number(route.params.trainingId ?? 1);

const selectedDate = ref(null);
const selectedTimes = ref([]);
const existingSchedules = ref([]);

const fetchExistingSchedules = async () => {
  try {
    const { data } = await getTrainerSchedulesByTrainerId(TRAINER_ID);
    if (data?.success) existingSchedules.value = data.data || [];
  } catch (e) {
    console.error("스케줄 조회 실패:", e);
  }
};

onMounted(async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.value = today;
  await fetchExistingSchedules();
});

// ✅ 단일 선택 강제: 새로 선택하면 마지막 선택만 유지
watch(selectedTimes, (val) => {
  if (val.length > 1) selectedTimes.value = [val[val.length - 1]];
});

const submitReservation = async () => {
  if (!selectedDate.value || selectedTimes.value.length !== 1) {
    alert("예약할 시간을 하나만 선택하세요.");
    return;
  }

  // "HH:mm" → start/end 계산(30분 고정)
  const [H, M] = selectedTimes.value[0].split(":").map(Number);
  const start = new Date(selectedDate.value);
  start.setHours(H, M, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const payload = {
    trainerId: TRAINER_ID,
    trainingId: TRAINING_ID,
    startTime: dayjs(start).format("YYYY-MM-DDTHH:mm:ss"),
    endTime: dayjs(end).format("YYYY-MM-DDTHH:mm:ss"),
  };

  try {
    const { data } = await createTraineeReservation(payload); // ✅ 예약 생성
    if (data?.success) {
      alert("예약이 성공적으로 생성되었습니다.");
      selectedTimes.value = [];
      await fetchExistingSchedules(); // 목록 갱신
    } else {
      alert(data?.message ?? "예약 생성 실패");
      console.log(data);
    }
  } catch (e) {
    console.error("예약 생성 실패:", e);
    // 서버 표준 응답 메시지 출력
    alert(e.response?.data?.message ?? "서버 오류가 발생했습니다.");
  }
};
</script>

<template>
  <div class="flex min-h-screen flex-col px-2 pb-24 pt-4">
    <div class="flex-1 overflow-y-auto">
      <DateTimeSlotsPicker
        v-model:modelValueDate="selectedDate"
        v-model:modelValueTimes="selectedTimes"
        :existing-schedules="existingSchedules"
        :holidays="['2025-08-15']"
        mode="reservation"
      />

      <div class="mt-6">
        <BaseButton
          :disabled="!selectedDate || selectedTimes.length !== 1"
          @click="submitReservation"
        >
          예약하기
        </BaseButton>
      </div>
    </div>
  </div>
</template>
