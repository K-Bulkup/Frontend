<template>
  <div class="flex min-h-screen flex-col bg-realBlack px-6 py-20">
    <div v-if="step === 1" class="flex flex-1 flex-col justify-between">
      <div>
        <BaseStatusMessage
          title="어떤 트레이닝을 하실 건가요?"
          subtitle="원하시는 카테고리를 선택해주세요"
          variant="guide"
        />

        <div class="mt-12 flex flex-col space-y-3.5">
          <button
            v-for="category in CATEGORIES"
            :key="category"
            @click="handleSelectCategory(category)"
            :class="[
              'w-full rounded-xl border-2 border-solid py-3 text-center text-base transition-colors',
              selectedCategory === category
                ? 'border-primary bg-primary text-black'
                : 'border-gray-100 bg-gray-100 text-black hover:bg-gray-200',
            ]"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="step === 2" class="flex flex-1 flex-col">
      <div class="mb-8">
        <div class="mb-4 flex items-center">
          <button @click="goBackToStep1" class="mr-4 text-white">
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
          <h1 class="text-title text-white">트레이닝 오픈</h1>
        </div>
        <div class="mb-2 text-subtext text-gray-700">
          선택된 카테고리: {{ selectedCategory }}
        </div>
        <div class="text-subtext text-gray-700">
          트레이닝 커리큘럼을 만들어주세요.
        </div>
      </div>

      <div class="mb-6">
        <div class="mb-2 text-subtext text-gray-700">트레이너명</div>
        <input
          v-model="trainerName"
          type="text"
          placeholder="Trainer01"
          class="w-full rounded-xl border-none bg-gray-100 p-4 text-body text-black outline-none"
        />
      </div>

      <div class="mb-8">
        <div class="mb-2 text-subtext text-gray-700">트레이닝 소개</div>
        <textarea
          v-model="trainingDescription"
          placeholder="트레이닝에 대한 소개를 입력해주세요"
          rows="4"
          class="w-full resize-none rounded-xl border-none bg-gray-100 p-4 text-body text-black outline-none"
        ></textarea>
      </div>

      <div class="mb-8">
        <div class="mb-4 text-subtext text-gray-700">난이도</div>
        <div class="flex space-x-3">
          <button
            v-for="level in difficultyLevels"
            :key="level"
            @click="selectedDifficulty = level"
            :class="[
              'rounded-full px-6 py-2 text-subtext transition-colors',
              selectedDifficulty === level
                ? 'bg-primary text-black'
                : 'bg-gray-100 text-black hover:bg-gray-200',
            ]"
          >
            {{ level }}
          </button>
        </div>
      </div>

      <div class="mb-6 flex-1">
        <div v-for="section in routineSections" :key="section.key" class="mb-4">
          <div
            @click="toggleSection(section.key)"
            class="flex cursor-pointer items-center justify-between rounded-t-xl bg-gray-800 p-4"
          >
            <span class="text-body text-white">{{ section.title }}</span>
            <div class="flex items-center">
              <button
                @click.stop="addRoutine(section.key)"
                class="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary"
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
              <svg
                :class="[
                  'text-white transition-transform',
                  { 'rotate-180': !expandedSections[section.key] },
                ]"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M19 9L12 16L5 9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <div
            v-if="expandedSections[section.key]"
            class="rounded-b-xl bg-gray-100"
          >
            <div v-if="routines[section.key].length > 0">
              <div
                v-for="(routine, index) in routines[section.key]"
                :key="index"
                class="border-b border-gray-200 p-4 last:border-b-0"
              >
                <div class="mb-2 flex items-center justify-between">
                  <input
                    v-model="routine.name"
                    placeholder="루틴 제목을 입력하세요"
                    class="flex-1 border-none bg-transparent text-body text-black outline-none"
                  />
                  <span class="text-caption text-gray-700">+1P</span>
                </div>
              </div>
            </div>
            <div v-else class="p-4 text-center text-subtext text-gray-700">
              루틴을 추가해주세요
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-auto">
      <BaseButton @click="handleNext" :isDisabled="isNextButtonDisabled">
        {{ step === 1 ? "다음" : "트레이닝 생성 완료" }}
      </BaseButton>
    </div>

    <div
      class="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-realBlack"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// 공통 컴포넌트 import (경로는 프로젝트에 맞게 수정)
import BaseButton from "@/components/common/BaseButton.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";

const router = useRouter();

// 1. 상태(State) 통합

// --- 단계 관리
const step = ref(1); // 1: 카테고리 선택, 2: 커리큘럼 작성

// --- 1단계 데이터 (카테고리 선택)
const CATEGORIES = [
  "재무설계",
  "현금관리",
  "신용과 부채관리",
  "위험관리와 보험설계",
  "투자설계",
  "세금설계",
  "기타",
];
const selectedCategory = ref(null);

// --- 2단계 데이터 (커리큘럼 작성)
const trainerName = ref("Trainer01");
const trainingDescription = ref("");
const selectedDifficulty = ref("");
const difficultyLevels = ["초급", "중급", "고급"];

const routineSections = [
  { key: "stretching", title: "스트레칭" },
  { key: "strength", title: "근력" },
  { key: "cardio", title: "유산소" },
];

const expandedSections = ref({
  stretching: true,
  strength: true,
  cardio: true,
});

const routines = ref({
  stretching: [],
  strength: [],
  cardio: [],
});

// 2. 계산된 속성(Computed) 통합

const isNextButtonDisabled = computed(() => {
  if (step.value === 1) {
    // 1단계 비활성화 조건
    return !selectedCategory.value;
  }
  if (step.value === 2) {
    // 2단계 비활성화 조건
    return (
      !trainerName.value.trim() ||
      !trainingDescription.value.trim() ||
      !selectedDifficulty.value ||
      (routines.value.stretching.length === 0 &&
        routines.value.strength.length === 0 &&
        routines.value.cardio.length === 0)
    );
  }
  return true; // 기본적으로 비활성화
});

// 3. 함수(Methods) 통합

// --- 1단계 함수
const handleSelectCategory = (category) => {
  selectedCategory.value = category;
};

// --- 2단계 함수
const goBackToStep1 = () => {
  step.value = 1;
};

const toggleSection = (sectionKey) => {
  expandedSections.value[sectionKey] = !expandedSections.value[sectionKey];
};

const addRoutine = (category) => {
  routines.value[category].push({ name: "", points: 1 });
  // 루틴 추가 시 섹션이 닫혀있으면 열어줌
  if (!expandedSections.value[category]) {
    expandedSections.value[category] = true;
  }
};

// --- 공통 함수 (단계에 따라 다르게 동작)
const handleNext = () => {
  if (isNextButtonDisabled.value) return;

  if (step.value === 1) {
    // 1단계 -> 2단계로 이동
    step.value = 2;
  } else if (step.value === 2) {
    // 2단계 완료: 데이터 취합 및 전송
    const curriculumData = {
      category: selectedCategory.value, // 1단계에서 선택한 카테고리
      trainerName: trainerName.value,
      description: trainingDescription.value,
      difficulty: selectedDifficulty.value,
      routines: routines.value,
    };

    console.log("최종 커리큘럼 데이터:", curriculumData);
    alert("트레이닝 생성이 완료되었습니다!");
    // 예: router.push('/trainer/dashboard');
  }
};
</script>

<style scoped>
textarea::-webkit-scrollbar {
  width: 4px;
}
textarea::-webkit-scrollbar-track {
  background: transparent;
}
textarea::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 2px;
}
textarea::-webkit-scrollbar-thumb:hover {
  background: #595959;
}
</style>
