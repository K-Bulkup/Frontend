<script setup>
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import BaseButton from "@/components/common/BaseButton.vue";
import DateTimeSlotsPicker from "@/components/chat/DateTimeSlotsPicker.vue";
import {
  getTrainerSchedules,
  createTrainerSchedules,
} from "@/composables/api/usePtApi";

const selectedDate = ref(null);
const selectedTimes = ref([]);
const existingSchedules = ref([]);

const fetchExistingSchedules = async () => {
  try {
    const { data } = await getTrainerSchedules();
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

const submitReservation = async () => {
  if (!selectedDate.value || selectedTimes.value.length === 0) return;

  const timeSlots = selectedTimes.value.map((time) => {
    const [H, M] = time.split(":").map(Number);
    const start = new Date(selectedDate.value);
    start.setHours(H, M, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    return {
      startTime: dayjs(start).format("YYYY-MM-DDTHH:mm:ss"),
      endTime: dayjs(end).format("YYYY-MM-DDTHH:mm:ss"),
    };
  });

  try {
    const { data } = await createTrainerSchedules(timeSlots);
    if (data?.success) {
      alert("일정이 성공적으로 등록되었습니다.");
      selectedTimes.value = [];
      await fetchExistingSchedules();
    } else {
      alert("일정 등록 실패");
      console.log(data);
    }
  } catch (e) {
    console.error("등록 실패:", e);
    alert(e.response?.data?.message ?? "서버 오류가 발생했습니다.");
  }
};
</script>

<template>
  <div class="flex min-h-screen flex-col px-2 pb-24 pt-4">
    <div class="flex-1 overflow-y-auto">
      <!-- mode="schedule" 추가 -->
      <DateTimeSlotsPicker
        v-model:modelValueDate="selectedDate"
        v-model:modelValueTimes="selectedTimes"
        :existing-schedules="existingSchedules"
        :holidays="['2025-08-15']"
        mode="schedule"
      />

      <div class="mt-6">
        <BaseButton
          :disabled="!selectedDate || selectedTimes.length === 0"
          @click="submitReservation"
        >
          등록하기
        </BaseButton>
      </div>
    </div>
  </div>
</template>
