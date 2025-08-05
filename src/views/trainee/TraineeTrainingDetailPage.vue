<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getTraineeTrainingDetail } from "@/composables/api/trainee/training/traineeTrainingDetailAPI";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import TraineeRoutineSection from "@/components/trainee/training/TraineeRoutineSection.vue";
import ActionButton from "@/components/trainee/training/ActionButton.vue";
import DoughnutChart from "@/components/trainee/training/DoughnutChart.vue";

const router = useRouter();
const route = useRoute();

const trainingData = ref(null);

// 루틴 분류 (flat 배열 → 스트레칭/근력/유산소 3등분)
function groupRoutines(routines) {
  return {
    stretching: routines.slice(0, 3).map((r) => ({
      id: r.routineId,
      name: r.title,
      completed: r.completed,
      rewardPoint: r.rewardPoint,
    })),
    strength: routines.slice(3, 6).map((r) => ({
      id: r.routineId,
      name: r.title,
      completed: r.completed,
      rewardPoint: r.rewardPoint,
    })),
    cardio: routines.slice(6).map((r) => ({
      id: r.routineId,
      name: r.title,
      completed: r.completed,
      rewardPoint: r.rewardPoint,
    })),
  };
}

//  API 호출 및 데이터 매핑
const loadTrainingData = async () => {
  try {
    const trainingId = route.params.trainingId; // 라우트 파라미터 사용
    console.log(
      " API 호출 시도 URL:",
      `/api/trainee/trainings/running/${trainingId}`,
    );

    const res = await getTraineeTrainingDetail(trainingId); // API 호출
    console.log(" API 응답:", res);

    const raw = res.data.data; // 응답 데이터에서 raw 선언

    trainingData.value = {
      startDate: new Date().toISOString().split("T")[0], // dueDate 없으므로 임시
      trainerName: raw.trainerName || "트레이너명 준비중",
      trainerRating: raw.averageRating,
      studentCount: raw.traineeCount,
      totalWeeks: 4, // 응답에 없으므로 임시 값
      title: raw.title,
      progress: raw.progress,
      totalReward: raw.totalScore,
      routines: groupRoutines(raw.routines),
    };
  } catch (err) {
    console.error(" 트레이닝 상세 조회 실패:", err);
  }
};

onMounted(loadTrainingData);

//  상태
const expandedSections = ref({
  stretching: true,
  strength: false,
  cardio: false,
});

//  트레이닝 기간 종료 여부 계산
const isTrainingExpired = computed(() => {
  if (!trainingData.value?.startDate) return false;
  const endDate = new Date(trainingData.value.startDate);
  endDate.setMonth(endDate.getMonth() + 1); // 기존 로직 기준 1개월
  return new Date() > endDate;
});

//  Computed
const trainingDeadline = computed(() => {
  if (!trainingData.value?.startDate) return "";
  const startDate = new Date(trainingData.value.startDate);
  startDate.setMonth(startDate.getMonth() + 1);
  return `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, "0")}.${String(startDate.getDate()).padStart(2, "0")}`;
});

const isStretchingComplete = computed(
  () =>
    trainingData.value?.routines.stretching.length > 0 &&
    trainingData.value.routines.stretching.every((q) => q.completed),
);
const isStrengthComplete = computed(
  () =>
    trainingData.value?.routines.strength.length > 0 &&
    trainingData.value.routines.strength.every((q) => q.completed),
);
const areAllQuestsComplete = computed(
  () =>
    isStretchingComplete.value &&
    isStrengthComplete.value &&
    trainingData.value?.routines.cardio.every((q) => q.completed),
);

//  Methods
const goToRoutineDetail = (quest) => {
  router.push(
    `/trainee/mypage/training/${route.params.trainingId}/routine/${quest.id}`,
  );
};
const goBack = () => router.back();
const toggleSection = (key) => {
  if (key === "strength" && !isStretchingComplete.value) return;
  if (key === "cardio" && !isStrengthComplete.value) return;
  expandedSections.value[key] = !expandedSections.value[key];
};
const isSectionLocked = (key) =>
  key === "strength"
    ? !isStretchingComplete.value
    : key === "cardio"
      ? !isStrengthComplete.value
      : false;

//  버튼 표시 조건
const showChatButton = computed(() => areAllQuestsComplete.value);
const showReviewButton = computed(
  () => areAllQuestsComplete.value || isTrainingExpired.value,
);
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack px-6 pb-24 pt-4">
    <BaseHeader title="트레이닝 상세" @back="goBack" />

    <main v-if="trainingData" class="flex-1">
      <!-- 배지 -->
      <div class="mt-4 flex items-center gap-2">
        <BaseBadge>{{ trainingData.level || "초급" }}</BaseBadge>
        <BaseBadge>{{ trainingData.category || "투자입문" }}</BaseBadge>
        <BaseBadge variant="primary" class="ml-auto"
          >총 리워드 {{ trainingData.totalReward }}P</BaseBadge
        >
      </div>

      <!-- 진행률 차트 -->
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
          트레이닝 기한: {{ trainingDeadline }}까지
        </p>
      </div>

      <!-- 트레이너 정보 -->
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

      <!-- 제목 -->
      <h2 class="mb-5 text-heading font-bold text-white">
        {{ trainingData.title }}
      </h2>

      <!-- 루틴 섹션 -->
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

      <!-- 액션 버튼 -->
      <div class="mt-10 flex flex-col gap-3">
        <ActionButton
          v-if="showReviewButton"
          text="리뷰 작성하기"
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

        <!-- 트레이너와 1:1 채팅하기 (아래, 조건부 표시) -->
        <ActionButton
          v-if="showChatButton"
          text="트레이너와 1:1 채팅하기"
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
      </div>
    </main>
  </div>
</template>
