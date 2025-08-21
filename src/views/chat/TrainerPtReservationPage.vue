<script setup>
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import BaseButton from "@/components/common/BaseButton.vue";
import ActionStateModal from "@/components/common/ActionStateModal.vue";
import DateTimeSlotsPicker from "@/components/chat/DateTimeSlotsPicker.vue";
import {
  getTrainerSchedules,
  createTrainerSchedules,
} from "@/composables/api/usePtApi";

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
      // alert 대신 성공 모달 표시
      modalConfig.value = {
        title: "일정 등록 완료!",
        subtitle: "일정이 성공적으로 등록되었습니다.",
        confirmButtonText: "확인",
      };
      showModal.value = true;

      selectedTimes.value = [];
      await fetchExistingSchedules();
    } else {
      // 실패 모달 표시
      modalConfig.value = {
        title: "일정 등록 실패",
        subtitle: "일정 등록에 실패했습니다. 다시 시도해주세요.",
        confirmButtonText: "확인",
      };
      showModal.value = true;
      console.log(data);
    }
  } catch (e) {
    console.error("등록 실패:", e);
    // 에러 모달 표시
    modalConfig.value = {
      title: "등록 실패",
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

    <!-- 성공/실패 모달 -->
    <ActionStateModal
      v-if="showModal"
      :title="modalConfig.title"
      :subtitle="modalConfig.subtitle"
      :confirm-button-text="modalConfig.confirmButtonText"
      @close="handleModalClose"
    />
  </div>
</template>
