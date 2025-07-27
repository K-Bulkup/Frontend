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
const expandedSections = ref({
  stretching: true,
  strength: true,
  cardio: true,
});

// thumbnail과 thumbnailUrl 상태 변수 선언
const thumbnail = ref(null);
const thumbnailUrl = ref(null);

// 모달의 표시 여부와 현재 카테고리를 관리할 상태
const isModalVisible = ref(false);
const currentCategory = ref(null);

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
  if (step.value > 1) {
    step.value--;
  } else {
    router.back();
  }
};

const handleSectionToggle = (sectionKey) => {
  expandedSections.value[sectionKey] = !expandedSections.value[sectionKey];
};

const handleOpenRoutineModal = (category) => {
  currentCategory.value = category;
  isModalVisible.value = true;
};

const onRoutineSaved = (newRoutine) => {
  if (currentCategory.value) {
    routines.value[currentCategory.value].push({
      id: Date.now(),
      name: newRoutine.name,
    });
  }
  isModalVisible.value = false;
};

const handleNextStep = () => {
  if (isNextButtonDisabled.value) return;

  if (step.value < 3) {
    step.value++;
  } else if (step.value === 3) {
    // 3단계에서 '트레이닝 오픈하기'를 누르면 최종 데이터 처리
    const finalData = {
      category: selectedCategory.value,
      trainerName: trainerName.value,
      description: trainingDescription.value,
      difficulty: selectedDifficulty.value,
      routines: routines.value,
      thumbnail: thumbnail.value,
    };
    console.log("최종 제출 데이터:", finalData);

    // 데이터 처리 후 4단계(완료 화면)로 이동
    step.value = 4;
  }
};

// 4단계 완료 화면에서 '확인' 버튼을 눌렀을 때 실행될 함수
const handleCompletion = () => {
  router.push("/trainer/mypage/training");
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    thumbnail.value = file;
    thumbnailUrl.value = URL.createObjectURL(file);
  }
};

const triggerFileInput = () => {
  document.getElementById("thumbnailInput").click();
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack px-6 pb-20 pt-10">
    <div>
      <header class="mb-6 flex h-10 items-center justify-between">
        <button @click="handleGoBack" class="text-white">
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
        <h2 class="text-heading text-white">트레이닝 오픈</h2>
        <div class="w-6"></div>
      </header>

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

      <div v-else-if="step === 2" class="flex flex-1 flex-col">
        <BaseStatusMessage
          class="mb-8 text-left"
          title="트레이닝 커리큘럼을 알려주세요"
          subtitle="회원에게 보여줄 커리큘럼을 작성해주세요"
          variant="guide"
        />

        <main class="flex-1">
          <div class="mb-6">
            <label class="mb-2 block text-subtext text-gray-50"
              >트레이닝명</label
            >
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

      <div v-else-if="step === 3">
        <BaseStatusMessage
          title="회원을 모집하겠습니까?"
          subtitle="커버 이미지를 등록하고 회원을 모집해주세요"
        />

        <!-- 이미지 업로드 영역 -->
        <div class="mt-12 flex flex-col items-center">
          <input
            type="file"
            id="thumbnailInput"
            @change="onFileChange"
            class="hidden"
            accept="image/*"
          />
          <div
            @click="triggerFileInput"
            class="flex h-64 w-full cursor-pointer items-center justify-center rounded-md bg-gray-100 transition-colors hover:bg-gray-200"
          >
            <img
              v-if="thumbnailUrl"
              :src="thumbnailUrl"
              class="h-full w-full rounded-md object-cover"
            />
            <div v-else class="text-center text-gray-700">
              <svg
                class="mx-auto h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p class="mt-2 text-subtext">클릭하여 이미지 업로드</p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="step === 4"
        class="flex flex-1 flex-col items-center justify-center pt-24"
      >
        <div
          class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white"
        >
          <svg
            class="h-8 w-8 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <BaseStatusMessage
          title="등록이 완료되었습니다"
          subtitle="트레이닝이 오픈되었습니다!"
        />

        <div class="mt-8 w-full">
          <BaseButton @click="handleCompletion">확인</BaseButton>
        </div>
      </div>
    </div>

    <!-- 하단 버튼 영역 -->
    <div v-if="step < 4" class="mt-10">
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
