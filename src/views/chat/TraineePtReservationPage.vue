<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";

import BaseButton from "@/components/common/BaseButton.vue";
import ActionStateModal from "@/components/common/ActionStateModal.vue";
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

// 모달 상태 관리
const showModal = ref(false);
const modalConfig = ref({
  title: "",
  subtitle: "",
  confirmButtonText: "확인",
});

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
    // alert 대신 모달 표시
    modalConfig.value = {
      title: "시간 선택 필요",
      subtitle: "예약할 시간을 하나만 선택하세요.",
      confirmButtonText: "확인",
    };
    showModal.value = true;
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
      // alert 대신 성공 모달 표시
      modalConfig.value = {
        title: "예약 완료!",
        subtitle: "예약이 성공적으로 생성되었습니다.",
        confirmButtonText: "확인",
      };
      showModal.value = true;

      selectedTimes.value = [];
      await fetchExistingSchedules(); // 목록 갱신
    } else {
      // 실패 모달 표시
      modalConfig.value = {
        title: "예약 생성 실패",
        subtitle: data?.message ?? "예약 생성에 실패했습니다.",
        confirmButtonText: "확인",
      };
      showModal.value = true;
      console.log(data);
    }
  } catch (e) {
    console.error("예약 생성 실패:", e);
    // 에러 모달 표시
    modalConfig.value = {
      title: "예약 실패",
      subtitle: e.response?.data?.message ?? "서버 오류가 발생했습니다.",
      confirmButtonText: "확인",
    };
    showModal.value = true;
  }
};

// 모달 닫기 핸들러
const handleModalClose = () => {
  showModal.value = false;
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

    <!-- 예약 상태 모달 -->
    <ActionStateModal
      v-if="showModal"
      :title="modalConfig.title"
      :subtitle="modalConfig.subtitle"
      :confirm-button-text="modalConfig.confirmButtonText"
      @close="handleModalClose"
    />
  </div>
</template>
