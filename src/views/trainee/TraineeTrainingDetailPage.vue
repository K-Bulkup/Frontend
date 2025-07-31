<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import TraineeRoutineSection from "@/components/trainee/training/TraineeRoutineSection.vue";
import ActionButton from "@/components/trainee/training/ActionButton.vue";
import DoughnutChart from "@/components/trainee/training/DoughnutChart.vue";

// 상태 (State)

const router = useRouter();
const route = useRoute();

// 가상의 트레이닝 상세 데이터
const trainingData = ref({
  trainerName: "김헬스",
  trainerRating: 4.8,
  studentCount: 15,
  totalWeeks: 8,
  title: "초보자를 위한 주식 투자 완전 정복",
  progress: 70.0,
  routines: {
    stretching: [
      { id: 1, name: "계좌 개설하기", completed: true },
      { id: 2, name: "증권사 앱 설치하기", completed: true },
      { id: 3, name: "관심 종목 등록하기", completed: true },
    ],
    strength: [
      { id: 4, name: "첫 주식 매수하기", completed: true },
      { id: 5, name: "매매일지 작성하기", completed: false },
      { id: 6, name: "분할 매수/매도 연습", completed: false },
    ],
    cardio: [
      { id: 7, name: "경제 뉴스 스크랩하기", completed: false },
      { id: 8, name: "모의 투자 진행하기", completed: false },
    ],
  },
});

// 아코디언 메뉴 확장/축소 상태
const expandedSections = ref({
  stretching: true,
  strength: false,
  cardio: false,
});

// 페이지 이동 메서드
const goToRoutineDetail = (routineId) => {
  const trainingId = route.params.id;
  router.push(`/trainee/mypage/training/${trainingId}/routine/${routineId}`);
};

// 계산된 속성 (Computed)

const questStats = computed(() => {
  const allQuests = Object.values(trainingData.value.routines).flat();
  const completedQuests = allQuests.filter((q) => q.completed);
  return {
    total: allQuests.length,
    completed: completedQuests.length,
  };
});

const isStretchingComplete = computed(() =>
  trainingData.value.routines.stretching.every((q) => q.completed),
);
const isStrengthComplete = computed(() =>
  trainingData.value.routines.strength.every((q) => q.completed),
);

const areAllQuestsComplete = computed(
  () =>
    isStretchingComplete.value &&
    isStrengthComplete.value &&
    trainingData.value.routines.cardio.every((q) => q.completed),
);

// 메서드 (Methods)

const goBack = () => {
  router.back();
};

const toggleSection = (sectionKey) => {
  if (sectionKey === "strength" && !isStretchingComplete.value) return;
  if (sectionKey === "cardio" && !isStrengthComplete.value) return;

  expandedSections.value[sectionKey] = !expandedSections.value[sectionKey];
};

const isSectionLocked = (sectionKey) => {
  if (sectionKey === "strength") return !isStretchingComplete.value;
  if (sectionKey === "cardio") return !isStrengthComplete.value;
  return false;
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack px-6 pb-24 pt-10">
    <BaseHeader title="트레이닝 상세" @back="goBack" />

    <main class="flex-1">
      <div class="mt-4 flex items-center gap-2">
        <BaseBadge>초급</BaseBadge>
        <BaseBadge>투자입문</BaseBadge>
        <BaseBadge variant="primary" class="ml-auto">총 리워드 20P</BaseBadge>
      </div>

      <div
        class="my-6 flex flex-col items-center justify-center rounded-xl border border-white p-6"
      >
        <div class="relative h-24 w-24">
          <DoughnutChart :progress="trainingData.progress" />

          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-title font-bold text-white"
              >{{ trainingData.progress }}%</span
            >
          </div>
        </div>
        <p class="mt-4 text-subtext font-bold text-gray-200">
          강의 기한: 2025.12.31까지
        </p>
      </div>

      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700"
          >
            <img
              src="@/assets/images/Image_Square.svg"
              alt="프로필"
              class="h-6 w-6"
            />
          </div>
          <p class="font-bold text-white">{{ trainingData.trainerName }}</p>
        </div>
        <div class="flex items-center gap-2 text-caption text-gray-200">
          <div class="flex items-center gap-1">
            <img src="@/assets/images/star.svg" alt="별점" class="h-3 w-3" />
            <span>{{ trainingData.trainerRating }}</span>
          </div>
          <span>|</span>
          <span>{{ trainingData.studentCount }}명 수강</span>
          <span>|</span>
          <span>{{ trainingData.totalWeeks }}주</span>
        </div>
      </div>

      <h2 class="mb-5 text-heading font-bold text-white">
        {{ trainingData.title }}
      </h2>

      <div class="space-y-2.5">
        <TraineeRoutineSection
          title="스트레칭"
          :quests="trainingData.routines.stretching"
          :is-locked="isSectionLocked('stretching')"
          :is-expanded="expandedSections.stretching"
          @toggle="toggleSection('stretching')"
          @routine-click="goToRoutineDetail"
        />
        <TraineeRoutineSection
          title="근력"
          :quests="trainingData.routines.strength"
          :is-locked="isSectionLocked('strength')"
          :is-expanded="expandedSections.strength"
          @toggle="toggleSection('strength')"
          @routine-click="goToRoutineDetail"
        />
        <TraineeRoutineSection
          title="유산소"
          :quests="trainingData.routines.cardio"
          :is-locked="isSectionLocked('cardio')"
          :is-expanded="expandedSections.cardio"
          @toggle="toggleSection('cardio')"
          @routine-click="goToRoutineDetail"
        />
      </div>

      <div class="mt-10 flex flex-col gap-3">
        <ActionButton
          text="트레이너와 1:1 채팅하기"
          :disabled="!areAllQuestsComplete"
          variant="primary"
        >
          <template #icon>
            <img
              src="@/assets/images/trainee/training/Chat_Circle.svg"
              alt="채팅"
              class="h-5 w-5"
            />
          </template>
        </ActionButton>

        <ActionButton
          text="리뷰 작성하기"
          :disabled="!areAllQuestsComplete"
          variant="secondary"
        >
          <template #icon>
            <img
              src="@/assets/images/trainee/training/Chat_Circle_Dots.svg"
              alt="리뷰"
              class="h-5 w-5"
            />
          </template>
        </ActionButton>
      </div>
    </main>
  </div>
</template>
