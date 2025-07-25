<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

import BaseButton from "@/components/common/BaseButton.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import RoutineAddModal from "./TrainerRoutineAddModal.vue";

// 상수 (Constants)
const FINANCE_CATEGORIES = [
  "재무설계",
  "현금관리",
  "신용과 부채관리",
  "위험관리와 보험설계",
  "투자설계",
  "세금설계",
  "기타",
];
const DIFFICULTY_LEVELS = ["초급", "중급", "고급"];
const ROUTINE_SECTIONS = [
  { key: "stretching", title: "스트레칭" },
  { key: "strength", title: "근력" },
  { key: "cardio", title: "유산소" },
];

// 라우터 및 상태 (Router & State)
const router = useRouter();
const step = ref(1);

// --- 1단계 데이터
const selectedCategory = ref(null);

// --- 2단계 데이터
const trainerName = ref("");
const trainingDescription = ref("");
const selectedDifficulty = ref("");
const routines = ref({
  stretching: [],
  strength: [],
  cardio: [],
});
const expandedSections = ref({
  stretching: true,
  strength: true,
  cardio: true,
});

// 모달의 표시 여부와 현재 카테고리를 관리할 상태 추가
const isModalVisible = ref(false);
const currentCategory = ref(null);

// 계산된 속성 (Computed)
const isNextButtonDisabled = computed(() => {
  if (step.value === 1) {
    return !selectedCategory.value;
  }
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
  return true;
});
const nextButtonText = computed(() => {
  return step.value === 3 ? "트레이닝 오픈하기" : "다음";
});

// 메서드 (Methods)
const handleCategorySelect = (category) => {
  selectedCategory.value = category;
};
const handleGoBack = () => {
  if (step.value === 2) {
    step.value = 1;
  } else {
    router.back();
  }
};
const handleSectionToggle = (sectionKey) => {
  expandedSections.value[sectionKey] = !expandedSections.value[sectionKey];
};

// '+' 버튼 클릭 시 모달을 열도록 함수를 수정
const handleOpenRoutineModal = (category) => {
  currentCategory.value = category; // 어떤 카테고리인지 저장
  isModalVisible.value = true; // 모달 열기
};

// 모달에서 저장 이벤트가 발생했을 때 실행될 함수 추가
const onRoutineSaved = (newRoutine) => {
  if (currentCategory.value) {
    routines.value[currentCategory.value].push({
      id: Date.now(),
      name: newRoutine.name,
    });
  }
  isModalVisible.value = false; // 모달 닫기
};

const handleNextStep = () => {
  if (isNextButtonDisabled.value) return;

  if (step.value === 1) {
    step.value = 2;
  } else if (step.value === 2) {
    const curriculumData = {
      category: selectedCategory.value,
      trainerName: trainerName.value,
      description: trainingDescription.value,
      difficulty: selectedDifficulty.value,
      routines: routines.value,
    };
    console.log("최종 커리큘럼 데이터:", curriculumData);
    alert("트레이닝 생성이 완료되었습니다!");
  }
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack px-6 pb-20 pt-10">
    <div class="h-10">
      <button v-if="step === 2" @click="handleGoBack" class="text-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div v-if="step === 1" class="flex flex-1 flex-col justify-between">
      <div>
        <BaseStatusMessage
          title="어떤 트레이닝을 하실 건가요?"
          subtitle="원하시는 카테고리를 선택해주세요"
          variant="guide"
        />
        <div class="mt-12 flex flex-col space-y-3.5">
          <button
            v-for="category in FINANCE_CATEGORIES"
            :key="category"
            :class="[
              'w-full rounded-md border-2 border-solid py-3 text-center text-body transition-colors',
              selectedCategory === category
                ? 'border-primary bg-primary text-black'
                : 'border-gray-100 bg-gray-100 text-black hover:bg-gray-200',
            ]"
            @click="handleCategorySelect(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-1 flex-col">
      <BaseStatusMessage
        class="mb-8 text-left"
        title="트레이닝 커리큘럼을 알려주세요"
        subtitle="회원에게 보여줄 커리큘럼을 작성해주세요"
        variant="guide"
      />

      <main class="flex-1">
        <div class="mb-6">
          <label class="mb-2 block text-subtext text-gray-50">트레이닝명</label>
          <input
            v-model="trainerName"
            type="text"
            placeholder="트레이닝명을 입력해주세요"
            class="w-full rounded-md border-none bg-gray-100 p-4 text-body text-black outline-none"
          />
        </div>
        <div class="mb-8">
          <label class="mb-2 block text-subtext text-gray-50"
            >트레이닝 소개</label
          >
          <textarea
            v-model="trainingDescription"
            placeholder="트레이닝에 대한 소개를 입력해주세요"
            rows="4"
            class="w-full resize-none rounded-md border-none bg-gray-100 p-4 text-body text-black outline-none"
          ></textarea>
        </div>
        <div class="mb-8">
          <div class="mb-4 text-subtext text-gray-50">난이도</div>
          <div class="flex items-center gap-2.5">
            <button
              v-for="level in DIFFICULTY_LEVELS"
              :key="level"
              :class="[
                'flex-1 rounded-md py-3 text-center text-subtext transition-colors',
                selectedDifficulty === level
                  ? 'bg-primary text-black'
                  : 'bg-gray-100 text-black hover:bg-gray-200',
              ]"
              @click="selectedDifficulty = level"
            >
              {{ level }}
            </button>
          </div>
        </div>

        <div class="mb-6">
          <div class="mb-4 text-subtext text-gray-50">루틴</div>
          <div
            v-for="section in ROUTINE_SECTIONS"
            :key="section.key"
            class="mb-2.5"
          >
            <div
              @click="handleSectionToggle(section.key)"
              class="flex cursor-pointer items-center justify-between rounded-md bg-gray-100 p-4"
            >
              <span class="text-body text-black">{{ section.title }}</span>
              <button
                @click.stop="handleOpenRoutineModal(section.key)"
                class="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1V11M1 6H11"
                    stroke="#090909"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
            <div v-if="expandedSections[section.key]" class="mt-2.5">
              <div
                v-if="routines[section.key].length > 0"
                class="flex flex-col gap-2.5 rounded-md bg-gray-100 p-4"
              >
                <div
                  v-for="routine in routines[section.key]"
                  :key="routine.id"
                  class="flex items-center justify-between rounded-md border border-gray-300 bg-white p-4"
                >
                  <span class="flex-1 text-body text-black">{{
                    routine.name
                  }}</span>
                  <span class="text-caption text-gray-700">+1P</span>
                </div>
              </div>
              <div
                v-else
                class="rounded-md bg-gray-800 p-4 text-center text-subtext text-gray-400"
              >
                루틴을 추가해주세요
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 하단 버튼 영역 -->
    <div class="mt-10">
      <BaseButton :isDisabled="isNextButtonDisabled" @click="handleNextStep">
        {{ nextButtonText }}
      </BaseButton>
    </div>

    <!-- 모달 컴포넌트 -->
    <RoutineAddModal
      v-if="isModalVisible"
      @close="isModalVisible = false"
      @save="onRoutineSaved"
    />
  </div>
</template>
