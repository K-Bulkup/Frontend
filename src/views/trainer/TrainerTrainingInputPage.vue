<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

import BaseButton from "@/components/common/BaseButton.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import RoutineAddModal from "./TrainerRoutineAddModal.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";
import { createTraining } from "@/plugins/axios";

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

// 3단계 데이터
const thumbnail = ref(null);
const thumbnailUrl = ref(null);

// 모달 상태
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
  return step.value >= 4;
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

const handleNextStep = async () => {
  if (isNextButtonDisabled.value) return;

  if (step.value < 3) {
    step.value++;
  } else if (step.value === 3) {
    const finalData = {
      category: selectedCategory.value,
      trainerName: trainerName.value,
      description: trainingDescription.value,
      difficulty: selectedDifficulty.value,
      routines: routines.value,
      // thumbnail: thumbnail.value, // FormData로 이미지를 보내려면 별도 처리가 필요합니다.
    };

    try {
      console.log("API로 보낼 데이터 (이미지 제외):", finalData);
      await createTraining(finalData);
      step.value = 4;
    } catch (error) {
      console.error("트레이닝 등록 실패:", error);
    }
  }
};

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
      <BaseHeader v-if="step < 4" title="트레이닝 오픈" @back="handleGoBack" />

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
              @click="handleCategorySelect(category)"
              :class="[
                'w-full rounded-xl border-2 border-solid py-3 text-center text-body transition-colors',
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
        <BaseStatusMessage
          class="mb-8 text-left"
          title="트레이닝 커리큘럼을 알려주세요"
          subtitle="회원에게 보여줄 커리큘럼을 작성해주세요"
          variant="guide"
        />

        <main class="flex-1">
          <div class="mb-6">
            <BaseFormField
              label="트레이닝명"
              placeholder="트레이닝명을 입력해주세요"
              v-model="trainerName"
            />
          </div>
          <div class="mb-8">
            <BaseFormField
              label="트레이닝 소개"
              placeholder="트레이닝에 대한 소개를 입력해주세요"
              v-model="trainingDescription"
              :isTextarea="true"
              :rows="4"
            />
          </div>

          <div class="mb-8">
            <div class="mb-4 text-subtext text-gray-50">난이도</div>
            <div class="flex items-center gap-2.5">
              <button
                v-for="level in DIFFICULTY_LEVELS"
                :key="level"
                @click="selectedDifficulty = level"
                :class="[
                  'flex-1 rounded-xl py-3 text-center text-subtext transition-colors',
                  selectedDifficulty === level
                    ? 'bg-primary text-black'
                    : 'bg-gray-100 text-black hover:bg-gray-200',
                ]"
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
                class="flex cursor-pointer items-center justify-between rounded-xl bg-gray-100 p-4"
              >
                <span class="text-body text-black">{{ section.title }}</span>
                <button
                  @click.stop="handleOpenRoutineModal(section.key)"
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
                >
                  <img src="@/assets/images/plus.svg" alt="추가 버튼" />
                </button>
              </div>
              <div v-if="expandedSections[section.key]" class="mt-2.5">
                <div
                  v-if="routines[section.key].length > 0"
                  class="flex flex-col gap-2.5 rounded-xl bg-gray-100 p-4"
                >
                  <div
                    v-for="routine in routines[section.key]"
                    :key="routine.id"
                    class="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <span class="flex-1 text-body text-black">{{
                      routine.name
                    }}</span>
                    <span class="text-caption text-gray-700">+1P</span>
                  </div>
                </div>
                <div
                  v-else
                  class="rounded-xl bg-gray-800 p-4 text-center text-subtext text-gray-700"
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

        <div class="mt-12 flex flex-col items-center">
          <input
            id="thumbnailInput"
            type="file"
            class="hidden"
            accept="image/*"
            @change="onFileChange"
          />
          <div
            @click="triggerFileInput"
            class="flex h-64 w-full cursor-pointer items-center justify-center rounded-xl bg-gray-100 transition-colors hover:bg-gray-200"
          >
            <img
              v-if="thumbnailUrl"
              :src="thumbnailUrl"
              class="h-full w-full rounded-xl object-cover"
            />
            <div v-else class="text-center text-gray-700">
              <img
                src="@/assets/images/Image_Square_gray.svg"
                alt="이미지 업로드"
                class="mx-auto h-12 w-12"
              />
              <p class="mt-2 text-subtext">클릭하여 이미지 업로드</p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="step === 4"
        class="flex flex-1 flex-col items-center pt-48"
      >
        <div
          class="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        >
          <img src="@/assets/images/check-mark.svg" alt="체크마크" />
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
      <BaseButton @click="handleNextStep" :isDisabled="isNextButtonDisabled">
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

<style scoped></style>
