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
const modalKey = ref(0);
const routineToEdit = ref(null);

// 계산된 속성 (Computed)
const isNextButtonDisabled = computed(() => {
  if (step.value === 1) return !selectedCategory.value;
  if (step.value === 2) {
    const isCurriculumInvalid =
      !trainerName.value.trim() ||
      !trainingDescription.value.trim() ||
      !selectedDifficulty.value ||
      routines.value.stretching.length === 0 ||
      routines.value.strength.length === 0 ||
      routines.value.cardio.length === 0;

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
const handleOpenRoutineModal = () => {
  routineToEdit.value = null; // 수정이 아니므로 null로 설정
  isModalVisible.value = true;
  modalKey.value++; // 모달을 새로 띄우기 위해 key 변경
};

// '기존 루틴' 클릭 시 (수정)
const handleEditRoutine = (routine) => {
  routineToEdit.value = routine;
  isModalVisible.value = true;
  modalKey.value++;
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

const convertKoreanToCategoryKey = (koreanType) => {
  switch (koreanType) {
    case "스트레칭":
      return "stretching";
    case "근력":
      return "strength";
    case "유산소":
      return "cardio";
    default:
      return null;
  }
};

const onRoutineSaved = (savedRoutineData) => {
  // 1. 루틴 수정일 경우 (루틴 타입 수정 가능)
  if (savedRoutineData.id) {
    // 기존 루틴의 위치(카테고리 키, 배열 인덱스) 찾기
    const oldCategoryKey = findRoutineCategory(savedRoutineData.id);
    const oldIndex = oldCategoryKey
      ? routines.value[oldCategoryKey].findIndex(
          (r) => r.id === savedRoutineData.id,
        )
      : -1;

    // 수정된 데이터에서 새로운 카테고리 키 가져오기
    const newCategoryKey = convertKoreanToCategoryKey(
      savedRoutineData.routineType,
    );

    // 기존 루틴을 찾았고, 새 카테고리도 유효하다면 로직 실행
    if (oldCategoryKey && oldIndex !== -1 && newCategoryKey) {
      // 카테고리가 변경되지 않은 경우 (예: '스트레칭' -> '스트레칭')
      if (oldCategoryKey === newCategoryKey) {
        routines.value[oldCategoryKey][oldIndex] = savedRoutineData;
      }
      // 카테고리가 변경된 경우 (예: '스트레칭' -> '근력')
      else {
        routines.value[oldCategoryKey].splice(oldIndex, 1);
        routines.value[newCategoryKey].push(savedRoutineData);
      }
    }
  }
  // 2. 루틴 새로 추가일 경우
  else {
    const targetCategoryKey = convertKoreanToCategoryKey(
      savedRoutineData.routineType,
    );
    if (targetCategoryKey && routines.value[targetCategoryKey]) {
      routines.value[targetCategoryKey].push({
        ...savedRoutineData,
        id: Date.now(),
      });
    }
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
  <div class="flex min-h-screen flex-col px-6 pb-20">
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
    />

    <LoadingOverlay :show="isLoading" title="트레이닝을 오픈 중입니다" />
  </div>
</template>
