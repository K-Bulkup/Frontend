<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

import BaseButton from "@/components/common/BaseButton.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";

import TrainingStep1Category from "@/components/trainer/training/TrainingStep1Category.vue";
import TrainingStep2Curriculum from "@/components/trainer/training/TrainingStep2Curriculum.vue";
import TrainingStep3Thumbnail from "@/components/trainer/training/TrainingStep3Thumbnail.vue";
import TrainingStep4Complete from "@/components/trainer/training/TrainingStep4Complete.vue";
import TrainerRoutineAddModal from "@/components/trainer/training/TrainerRoutineAddModal.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";

import { createTraining } from "@/composables/api/trainer/training/trainerTrainingAPI";

// 라우터 및 상태 (Router & State)
const router = useRouter();
const step = ref(1);
const isLoading = ref(false);

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
const currentRoutineCategory = ref(null);

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
      id: Date.now() + Math.random(),
      title: newRoutine.title,
      description: newRoutine.description,
      routineType: newRoutine.routineType,
      quizType: newRoutine.quizType,
      orderNumber: routines.value[currentRoutineCategory.value].length + 1,
      videoUrl: newRoutine.videoUrl,
      routineAnswer: newRoutine.routineAnswer,
    });
  }
  isModalVisible.value = false;
};

const handleNextStep = async () => {
  if (isNextButtonDisabled.value) return;

  if (step.value < 3) {
    step.value++;
    return;
  }

  if (step.value === 3) {
    const trainingDto = {
      title: trainerName.value,
      description: trainingDescription.value,
      category: selectedCategory.value,
      level: selectedDifficulty.value,
      routines: [
        ...routines.value.stretching,
        ...routines.value.strength,
        ...routines.value.cardio,
      ],
    };

    const formData = new FormData();
    formData.append(
      "dto",
      new Blob([JSON.stringify(trainingDto)], { type: "application/json" }),
    );
    if (thumbnail.value) formData.append("thumbnail", thumbnail.value);

    const MIN_MS = 1500;
    const start = Date.now();
    isLoading.value = true;

    try {
      await createTraining(formData);
      step.value = 4;
    } catch (error) {
      console.error("트레이닝 등록 실패:", error);
    } finally {
      const elapsed = Date.now() - start;
      const remain = Math.max(0, MIN_MS - elapsed);
      if (remain > 0) {
        await new Promise((r) => setTimeout(r, remain));
      }
      isLoading.value = false;
    }
  }
};

const handleCompletion = () => {
  router.push("/trainer/mypage/training");
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack px-6 pb-20 pt-4">
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

    <TrainerRoutineAddModal
      v-if="isModalVisible"
      @close="isModalVisible = false"
      @save="onRoutineSaved"
      :routineCategoryKey="currentRoutineCategory"
    />

    <LoadingOverlay :show="isLoading" title="트레이닝을 오픈 중입니다" />
  </div>
</template>
