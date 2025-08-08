<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useEnrollmentStore } from "@/stores/enrollment";
import {
  getTraineeTrainingDetail,
  getTraineeTrainingReviewBoolean,
} from "@/composables/api/trainee/training/traineeTrainingDetailAPI";
import { createCounseling } from "@/composables/api/useCounselingApi";

import profileDefault from "@/assets/images/mascot/profile.png";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import TraineeRoutineSection from "@/components/trainee/training/TraineeRoutineSection.vue";
import ActionButton from "@/components/trainee/training/ActionButton.vue";
import DoughnutChart from "@/components/trainee/training/DoughnutChart.vue";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const trainingData = ref(null);
const hasWrittenReview = ref(false);
const trainingId = ref(route.params.trainingId);
const userId = authStore.userId;
const enrollmentStore = useEnrollmentStore();

// API 호출 및 데이터 매핑
const loadTrainingData = async () => {
  try {
    const res = await getTraineeTrainingDetail(trainingId.value);
    const raw = res.data.data;
    if (raw.enrollmentId) {
      enrollmentStore.enrollmentId = raw.enrollmentId;
    } else {
      console.warn("❗ enrollmentId가 응답에 포함되지 않았습니다.");
    }

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
      trainerName:
        raw.trainerName || raw.trainerNickname || "트레이너명 준비중",
      trainerProfileUrl: raw.trainerProfileUrl || null,
      trainerId: raw.trainerId,
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

const checkReviewExist = async () => {
  try {
    const res = await getTraineeTrainingReviewBoolean(trainingId.value);
    hasWrittenReview.value = res.data.data;
  } catch (err) {
    console.error("리뷰 존재 여부 확인 실패:", err);
  }
};

onMounted(() => {
  loadTrainingData();
  checkReviewExist();
});

// 트레이너 상세 페이지로 이동
const goToTrainerPage = () => {
  if (trainingData.value.trainerId) {
    router.push(`/trainee/trainer/${trainingData.value.trainerId}`);
  } else {
    console.error("이동할 트레이너의 ID가 없습니다.");
  }
};

const expandedSections = ref({
  stretching: true,
  strength: false,
  cardio: false,
});

// 섹션 잠금 여부 (루틴 없을 때도 잠금 처리)
const isSectionLocked = (key) => {
  if (!trainingData.value?.routines) return false;

  const routineMap = {
    stretching: "스트레칭",
    strength: "근력",
    cardio: "유산소",
  };
  const routineList = trainingData.value.routines[routineMap[key]];

  // 루틴 없으면 자동 잠금
  if (!routineList || routineList.length === 0) return true;

  if (key === "strength") {
    return !trainingData.value.routines["스트레칭"]?.every((q) => q.completed);
  }
  if (key === "cardio") {
    return !trainingData.value.routines["근력"]?.every((q) => q.completed);
  }
  return false;
};

// 완료 여부 계산
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

// 루틴 상세 이동 (잠금 상태면 차단)
const goToRoutineDetail = (quest) => {
  if (!quest?.id) {
    console.error("❌ 루틴 ID가 존재하지 않음:", quest);
    return;
  }
  router.push(
    `/trainee/mypage/training/${route.params.trainingId}/routine/${quest.id}`,
  );
};

// 1:1 PT 채팅
const goToPtPage = async () => {
  try {
    const traineeId = authStore.user?.userId; // ← 로그인 유저 ID
    const trainingId = Number(route.params.trainingId); // ← 현재 트레이닝 ID
    const response = await apiClient.post("/api/common/counselings", {
      traineeId,
      trainingId,
    });
    const roomId = response.data.data.roomId;
    router.push(`/trainee/mypage/pt-chat/${roomId}`);
  } catch (error) {
    console.error("채팅방 생성 또는 조회 실패:", error);
  }
};

const goToReviewPage = () => {
  router.push(`/trainee/mypage/review/${route.params.trainingId}`);
};

const goBack = () => router.back();

// 섹션 토글 (잠금 상태면 차단)
const toggleSection = (key) => {
  if (isSectionLocked(key)) return;
  expandedSections.value[key] = !expandedSections.value[key];
};

// 트레이닝 기간 체크
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

// 단일 루틴 케이스 포함 (너의 개선된 로직 유지)
const showChatButton = computed(() => {
  const routines = trainingData.value?.routines;
  if (!routines) return false;
  const allRoutines = Object.values(routines)
    .flat()
    .filter((r) => r && r.id);
  if (allRoutines.length === 0) return false;
  const isSingleRoutine = allRoutines.length === 1;
  const singleCompleted = isSingleRoutine && allRoutines[0].completed;
  return areAllQuestsComplete.value || singleCompleted;
});

const showReviewButton = computed(() => {
  const routines = trainingData.value?.routines;
  if (!routines) return false;
  const allRoutines = Object.values(routines)
    .flat()
    .filter((r) => r && r.id);
  if (allRoutines.length === 0) return false;
  const isSingleRoutine = allRoutines.length === 1;
  const singleCompleted = isSingleRoutine && allRoutines[0].completed;
  return (
    areAllQuestsComplete.value || singleCompleted || isTrainingExpired.value
  );
});

// 다른 사람이 추가한 startChat 유지 (웹소켓 관련 로직)
const startChat = async () => {
  try {
    const response = await createCounseling(trainingId.value, userId);

    if (response.data.success && response.data.data?.roomId) {
      alert("채팅방이 생성되었습니다.");
      router.push(`/common/pt-chat/${response.data.data.roomId}`);
    } else {
      throw new Error(response.data.message || "채팅방 생성에 실패했습니다.");
    }
  } catch (err) {
    console.error("🚨 채팅방 생성 실패:", err);
    alert("채팅방 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
};

const goToQnaPage = () => {
  router.push(`/trainee/mypage/training/${route.params.trainingId}/qna`);
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack px-6 pb-24 pt-4">
    <BaseHeader title="트레이닝 상세" @back="goBack" />

    <main v-if="trainingData" class="flex-1">
      <!-- 배지 -->
      <div class="mt-4 flex items-center gap-2">
        <BaseBadge>{{ trainingData.level || "초급" }}</BaseBadge>
        <BaseBadge>{{ trainingData.category || "투자입문" }}</BaseBadge>
        <BaseBadge variant="primary" class="ml-auto">
          총 리워드 {{ trainingData.totalReward }}P
        </BaseBadge>
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
      <div class="mb-6 mt-6 flex items-center justify-between">
        <div
          @click="goToTrainerPage"
          class="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-800"
        >
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-700"
          >
            <img
              v-if="trainingData.trainerProfileUrl"
              :src="trainingData.trainerProfileUrl"
              alt="프로필"
              class="h-full w-full object-cover"
            />
            <img
              v-else
              :src="profileDefault"
              alt="기본 프로필"
              class="h-full w-full"
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
          <!-- Q&A 버튼 -->
          <button
            @click="goToQnaPage"
            class="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-black shadow"
          >
            Q&A
          </button>
        </div>
      </div>

      <h2 class="font mb-4 text-body text-white">{{ trainingData.title }}</h2>

      <!-- 루틴 섹션 -->
      <div class="space-y-2.5">
        <TraineeRoutineSection
          title="스트레칭"
          :quests="trainingData.routines['스트레칭']"
          :is-locked="isSectionLocked('stretching')"
          :is-expanded="expandedSections.stretching"
          @toggle="toggleSection('stretching')"
          @routine-click="
            (quest) => {
              if (!isSectionLocked('stretching')) goToRoutineDetail(quest);
            }
          "
        />
        <TraineeRoutineSection
          title="근력"
          :quests="trainingData.routines['근력']"
          :is-locked="isSectionLocked('strength')"
          :is-expanded="expandedSections.strength"
          @toggle="toggleSection('strength')"
          @routine-click="
            (quest) => {
              if (!isSectionLocked('strength')) goToRoutineDetail(quest);
            }
          "
        />
        <TraineeRoutineSection
          title="유산소"
          :quests="trainingData.routines['유산소']"
          :is-locked="isSectionLocked('cardio')"
          :is-expanded="expandedSections.cardio"
          @toggle="toggleSection('cardio')"
          @routine-click="
            (quest) => {
              if (!isSectionLocked('cardio')) goToRoutineDetail(quest);
            }
          "
        />
      </div>

      <!-- 액션 버튼 -->
      <div class="mt-10 flex flex-col gap-3">
        <ActionButton
          v-if="showReviewButton"
          :text="hasWrittenReview ? '리뷰 작성 완료' : '리뷰 작성하기'"
          :variant="hasWrittenReview ? 'disabled' : 'secondary'"
          :disabled="hasWrittenReview"
          @click="!hasWrittenReview && goToReviewPage()"
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
          @click="startChat"
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
