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

// ✅ API 호출 및 데이터 매핑 (Map → 배열 변환)
const loadTrainingData = async () => {
  try {
    const trainingId = route.params.trainingId;
    const res = await getTraineeTrainingDetail(trainingId);
    const raw = res.data.data;

    // ✅ Map 데이터를 배열로 변환하면서 id/name 필드 생성
    const convertRoutines = (routineList) =>
      routineList?.map((r) => ({
        id: r.routineId,
        name: r.title,
        completed: r.completed,
        rewardPoint: r.rewardPoint,
        completedAt: r.completedAt,
      })) || [];

    trainingData.value = {
      startDate: new Date().toISOString().split("T")[0],
      trainerName: raw.trainerName || "트레이너명 준비중",
      trainerRating: raw.averageRating,
      studentCount: raw.traineeCount,
      totalWeeks: 4,
      title: raw.title,
      progress: raw.progress,
      totalReward: raw.totalScore,
      routines: {
        스트레칭: convertRoutines(raw.routines["스트레칭"]),
        근력: convertRoutines(raw.routines["근력"]),
        유산소: convertRoutines(raw.routines["유산소"]),
      },
    };
  } catch (err) {
    console.error("🚨 트레이닝 상세 조회 실패:", err);
  }
};

onMounted(loadTrainingData);

const expandedSections = ref({
  stretching: true,
  strength: false,
  cardio: false,
});

// ✅ 섹션 잠금 여부
const isSectionLocked = (key) => {
  if (!trainingData.value?.routines) return false;
  if (key === "strength") {
    return !trainingData.value.routines["스트레칭"]?.every((q) => q.completed);
  }
  if (key === "cardio") {
    return !trainingData.value.routines["근력"]?.every((q) => q.completed);
  }
  return false;
};

// ✅ 완료 여부 계산
const isStretchingComplete = computed(
  () =>
    trainingData.value?.routines["스트레칭"]?.length > 0 &&
    trainingData.value.routines["스트레칭"].every((q) => q.completed),
);
const isStrengthComplete = computed(
  () =>
    trainingData.value?.routines["근력"]?.length > 0 &&
    trainingData.value.routines["근력"].every((q) => q.completed),
);
const areAllQuestsComplete = computed(
  () =>
    isStretchingComplete.value &&
    isStrengthComplete.value &&
    trainingData.value?.routines["유산소"]?.every((q) => q.completed),
);

// ✅ 루틴 상세 페이지 이동 (id 필드 사용)
const goToRoutineDetail = (quest) => {
  if (!quest?.id) {
    console.error("❌ 루틴 ID가 존재하지 않음:", quest);
    return;
  }
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

const isTrainingExpired = computed(() => {
  if (!trainingData.value?.startDate) return false;
  const endDate = new Date(trainingData.value.startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  return new Date() > endDate;
});

const trainingDeadline = computed(() => {
  if (!trainingData.value?.startDate) return "";
  const startDate = new Date(trainingData.value.startDate);
  startDate.setMonth(startDate.getMonth() + 1);
  return `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, "0")}.${String(
    startDate.getDate(),
  ).padStart(2, "0")}`;
});

const showChatButton = computed(() => areAllQuestsComplete.value);
const showReviewButton = computed(
  () => areAllQuestsComplete.value || isTrainingExpired.value,
);
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack px-6 pb-24 pt-4">
    <BaseHeader title="트레이닝 상세" @back="goBack" />

    <main v-if="trainingData" class="flex-1">
      <!-- ✅ 배지 -->
      <div class="mt-4 flex items-center gap-2">
        <BaseBadge>{{ trainingData.level || "초급" }}</BaseBadge>
        <BaseBadge>{{ trainingData.category || "투자입문" }}</BaseBadge>
        <BaseBadge variant="primary" class="ml-auto">
          총 리워드 {{ trainingData.totalReward }}P
        </BaseBadge>
      </div>

      <!-- ✅ 진행률 차트 -->
      <div
        class="my-6 flex flex-col items-center justify-center rounded-xl border border-white p-6"
      >
        <div class="relative h-24 w-24">
          <DoughnutChart :progress="trainingData.progress" />
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-title font-bold text-white">
              {{ trainingData.progress }}%
            </span>
          </div>
        </div>
        <p class="mt-4 text-subtext font-bold text-gray-200">
          트레이닝 기한: {{ trainingDeadline }}까지
        </p>
      </div>

      <!-- ✅ 루틴 섹션 -->
      <div class="space-y-2.5">
        <TraineeRoutineSection
          title="스트레칭"
          :quests="trainingData.routines['스트레칭']"
          :is-locked="isSectionLocked('stretching')"
          :is-expanded="expandedSections.stretching"
          @toggle="toggleSection('stretching')"
          @routine-click="goToRoutineDetail"
        />
        <TraineeRoutineSection
          title="근력"
          :quests="trainingData.routines['근력']"
          :is-locked="isSectionLocked('strength')"
          :is-expanded="expandedSections.strength"
          @toggle="toggleSection('strength')"
          @routine-click="goToRoutineDetail"
        />
        <TraineeRoutineSection
          title="유산소"
          :quests="trainingData.routines['유산소']"
          :is-locked="isSectionLocked('cardio')"
          :is-expanded="expandedSections.cardio"
          @toggle="toggleSection('cardio')"
          @routine-click="goToRoutineDetail"
        />
      </div>

      <!-- ✅ 액션 버튼 -->
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
