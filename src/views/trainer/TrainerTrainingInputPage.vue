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

const modalKey = ref(0);
const routineToEdit = ref(null);

// 계산된 속성 (Computed)
const isNextButtonDisabled = computed(() => {
  if (step.value === 1) return !selectedCategory.value;
  if (step.value === 2) {
    // 각 섹션별로 최소 1개의 루틴이 있는지 확인하는 로직
    const isCurriculumInvalid =
      !trainerName.value.trim() ||
      !trainingDescription.value.trim() ||
      !selectedDifficulty.value ||
      routines.value.stretching.length === 0 || // 스트레칭 루틴이 없거나
      routines.value.strength.length === 0 || // 근력 루틴이 없거나
      routines.value.cardio.length === 0; // 유산소 루틴이 없는 경우 true

    return isCurriculumInvalid;
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

// '새로 추가' 버튼 클릭 시
const handleOpenRoutineModal = (categoryKey) => {
  routineToEdit.value = null;
  currentRoutineCategory.value = categoryKey;
  isModalVisible.value = true;
  modalKey.value++;
};

// '기존 루틴' 클릭 시
const handleEditRoutine = (routine) => {
  routineToEdit.value = routine;
  // 루틴이 속한 카테고리를 찾아 설정
  currentRoutineCategory.value = findRoutineCategory(routine.id);
  isModalVisible.value = true;
  modalKey.value++; // key를 변경해서 모달을 새로고침
};

// 루틴 ID로 카테고리(stretching, strength, cardio)를 찾는 헬퍼 함수
const findRoutineCategory = (routineId) => {
  for (const category in routines.value) {
    if (routines.value[category].some((r) => r.id === routineId)) {
      return category;
    }
  }
  return null;
};

const onRoutineSaved = (savedRoutineData) => {
  // 수정일 경우 (ID가 이미 존재)
  if (savedRoutineData.id) {
    const category = findRoutineCategory(savedRoutineData.id);
    const index = routines.value[category].findIndex(
      (r) => r.id === savedRoutineData.id,
    );
    // 기존 루틴을 덮어쓰기
    if (index !== -1) routines.value[category][index] = savedRoutineData;
  }
  // 새로 추가일 경우
  else {
    routines.value[currentRoutineCategory.value].push({
      ...savedRoutineData,
      id: Date.now(), // 새 ID 발급
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
  <div class="flex min-h-screen flex-col px-6 pb-20 pt-4">
    <BaseHeader v-if="step < 4" title="트레이닝 오픈" @back="handleGoBack" />

    <div class="flex-grow">
      <TrainingStep1Category v-if="step === 1" v-model="selectedCategory" />

      <TrainingStep2Curriculum
        v-else-if="step === 2"
        v-model:trainerName="trainerName"
        v-model:description="trainingDescription"
        v-model:difficulty="selectedDifficulty"
        v-model:routines="routines"
        @edit-routine="handleEditRoutine"
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
      :key="modalKey"
      :initial-data="routineToEdit"
      @close="isModalVisible = false"
      @save="onRoutineSaved"
      :routineCategoryKey="currentRoutineCategory"
    />

    <LoadingOverlay :show="isLoading" title="트레이닝을 오픈 중입니다" />
  </div>
</template>
