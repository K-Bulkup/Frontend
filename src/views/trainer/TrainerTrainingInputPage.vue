<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

import BaseButton from "@/components/common/BaseButton.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";

import TrainingStep1Category from "@/components/trainer/training/TrainingStep1Category.vue";
import TrainingStep2Curriculum from "@/components/trainer/training/TrainingStep2Curriculum.vue";
import TrainingStep3Thumbnail from "@/components/trainer/training/TrainingStep3Thumbnail.vue";
import TrainingStep4Complete from "@/components/trainer/training/TrainingStep4Complete.vue";
import RoutineAddModal from "@/components/trainer/training/TrainerRoutineAddModal.vue";

import { createTraining } from "@/plugins/axios";

// 라우터 및 상태 (Router & State)
const router = useRouter();
const step = ref(1);

// 1단계 데이터
const selectedCategory = ref(null);

// 2단계 데이터
const trainerName = ref("");
const trainingDescription = ref("");
const selectedDifficulty = ref("");
const routines = ref({
  stretching: [],
  strength: [],
  cardio: [],
});

// 3단계 데이터
const thumbnail = ref(null);

// 모달 상태
const isModalVisible = ref(false);
const currentRoutineCategory = ref(null); // 'currentCategory'에서 이름 변경 (명확성)

// 계산된 속성 (Computed)
const isNextButtonDisabled = computed(() => {
  if (step.value === 1) return !selectedCategory.value;
  if (step.value === 2) {
    const hasNoRoutines =
      routines.value.stretching.length === 0 &&
      routines.value.strength.length === 0 &&
      routines.value.cardio.length === 0;
    return (
      !trainerName.value.trim() ||
      !trainingDescription.value.trim() ||
      !selectedDifficulty.value ||
      hasNoRoutines
    );
  }
  if (step.value === 3) return !thumbnail.value;
  return step.value >= 4;
});

const nextButtonText = computed(() => {
  return step.value === 3 ? "트레이닝 오픈하기" : "다음";
});

// 메서드 (Methods)
const handleGoBack = () => {
  if (step.value > 1) {
    step.value--;
  } else {
    router.back();
  }
};

const handleOpenRoutineModal = (categoryKey) => {
  currentRoutineCategory.value = categoryKey;
  isModalVisible.value = true;
};

const onRoutineSaved = (newRoutine) => {
  if (currentRoutineCategory.value) {
    routines.value[currentRoutineCategory.value].push({
      id: Date.now(),
      name: newRoutine.name,
    });
  }
  isModalVisible.value = false;
};

const handleNextStep = async () => {
  if (isNextButtonDisabled.value) return;

  if (step.value < 3) {
    step.value++;
  } else if (step.value === 3) {
    // 파일 업로드를 위해 FormData 사용
    const formData = new FormData();
    formData.append("category", selectedCategory.value);
    formData.append("trainerName", trainerName.value);
    formData.append("description", trainingDescription.value);
    formData.append("difficulty", selectedDifficulty.value);
    formData.append("routines", JSON.stringify(routines.value));
    if (thumbnail.value) {
      formData.append("thumbnail", thumbnail.value); // 파일 객체 추가
    }

    try {
      console.log("API로 FormData 전송:", ...formData.entries());
      await createTraining(formData);
      step.value = 4;
    } catch (error) {
      console.error("트레이닝 등록 실패:", error);
    }
  }
};

const handleCompletion = () => {
  router.push("/trainer/mypage/training");
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack px-6 pb-20 pt-10">
    <BaseHeader v-if="step < 4" title="트레이닝 오픈" @back="handleGoBack" />

    <div class="flex-grow">
      <TrainingStep1Category v-if="step === 1" v-model="selectedCategory" />

      <TrainingStep2Curriculum
        v-else-if="step === 2"
        v-model:trainerName="trainerName"
        v-model:description="trainingDescription"
        v-model:difficulty="selectedDifficulty"
        v-model:routines="routines"
        @open-routine-modal="handleOpenRoutineModal"
      />

      <TrainingStep3Thumbnail v-else-if="step === 3" v-model="thumbnail" />

      <TrainingStep4Complete
        v-else-if="step === 4"
        @confirm="handleCompletion"
      />
    </div>

    <div v-if="step < 4" class="mt-10">
      <BaseButton @click="handleNextStep" :isDisabled="isNextButtonDisabled">
        {{ nextButtonText }}
      </BaseButton>
    </div>

    <RoutineAddModal
      v-if="isModalVisible"
      @close="isModalVisible = false"
      @save="onRoutineSaved"
    />
  </div>
</template>
