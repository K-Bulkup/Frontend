<script setup>
import { ref, computed, onMounted, onActivated, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useEnrollmentStore } from "@/stores/enrollment";
import { getTraineeTrainingDetail } from "@/composables/api/trainee/training/traineeTrainingDetailAPI";
import { getTraineeTrainingStatus } from "@/composables/api/trainee/training/traineeTrainingDetailAPI";
import { createCounseling } from "@/composables/api/useCounselingApi";
import { useRoutineLockStore } from "@/stores/routineLock";

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
const enrollmentStore = useEnrollmentStore();
const routineLock = useRoutineLockStore();

const trainingData = ref(null);
const hasWrittenReview = ref(false);
const chatRoomCreated = ref(false);
const trainingId = ref(route.params.trainingId);
const userId = authStore.userId;
// 숫자 보정 헬퍼
const num = (v) => (v == null ? 0 : Number(v));

// 서버 응답에서 "PASS"만 true가 되도록 넓게 판정
const isServerPass = (r) =>
  r?.completed === "PASS" ||
  r?.passFailResult === "PASS" ||
  r?.status === "PASS" ||
  r?.isPassed === true;

// 서버 루틴 → 화면 루틴으로 매핑 (serverPass 플래그를 보존)
const convertRoutinesWithLock = (routineList) =>
  routineList?.map((r) => {
    const id = String(r.routineId);
    const serverPass = isServerPass(r);
    return {
      id,
      name: r.title,
      serverPass, // 보존해두고
      // ✅ 완료 = 서버 PASS or 로컬 lock
      completed: serverPass || routineLock.isLocked(id),
      rewardPoint: r.rewardPoint,
      completedAt: r.completedAt,
    };
  }) || [];

// 잠금 상태 변경 시 'completed'만 다시 합성
const applyLocalLockToTrainingData = () => {
  const td = trainingData.value;
  if (!td?.routines) return;
  const recompute = (list) =>
    list?.map((r) => ({
      ...r,
      completed: !!(r.serverPass || routineLock.isLocked(String(r.id))),
    })) || [];
  td.routines["스트레칭"] = recompute(td.routines["스트레칭"]);
  td.routines["근력"] = recompute(td.routines["근력"]);
  td.routines["유산소"] = recompute(td.routines["유산소"]);
};

// API 호출 및 데이터 매핑
const loadTrainingData = async () => {
  try {
    const eidNum = Number(enrollmentStore.enrollmentId);
    const res = Number.isFinite(eidNum)
      ? await getTraineeTrainingDetail(trainingId.value, {
          enrollmentId: eidNum,
        })
      : await getTraineeTrainingDetail(trainingId.value);

    const raw = res.data.data;

    if (raw.enrollmentId) {
      enrollmentStore.enrollmentId = raw.enrollmentId;
    } else {
      console.warn("❗ enrollmentId가 응답에 포함되지 않았습니다.");
    }

    trainingData.value = {
      startDate: new Date().toISOString().split("T")[0],
      trainerName:
        raw.trainerName || raw.trainerNickname || "트레이너명 준비중",
      trainerProfileUrl: raw.trainerProfileUrl || null,
      trainerId: raw.trainerId,
      trainerRating: raw.averageRating,
      // ✅ traineeCount 우선, 없으면 enrolled/total 대체
      studentCount: num(
        raw.traineeCount ?? raw.enrolledTraineeCount ?? raw.totalTraineeCount,
      ),
      totalWeeks: 4,
      title: raw.title,
      progress: raw.progress,
      totalReward: raw.totalScore,
      routines: {
        스트레칭: convertRoutinesWithLock(raw.routines?.["스트레칭"]),
        근력: convertRoutinesWithLock(raw.routines?.["근력"]),
        유산소: convertRoutinesWithLock(raw.routines?.["유산소"]),
      },
      level: raw.level,
      category: raw.category,
    };

    // 서버값 세팅 후, 잠금과 합성값을 다시 보정
    applyLocalLockToTrainingData();
  } catch (err) {
    console.error("🚨 트레이닝 상세 조회 실패:", err);
  }
};

const checkTrainingStatus = async () => {
  try {
    const res = await getTraineeTrainingStatus(trainingId.value);
    hasWrittenReview.value = res.data.data.hasWrittenReview;
    chatRoomCreated.value = res.data.data.chatRoomCreated;
  } catch (err) {
    console.error("트레이닝 상태 조회 실패:", err);
  }
};

onMounted(() => {
  loadTrainingData();
  checkTrainingStatus();
});

// 뒤로 돌아와도 최신화
onActivated(() => {
  loadTrainingData();
});

// 잠금 상태가 바뀌면 합성값 즉시 반영
watch(
  () => routineLock.lockedByRoutineId,
  () => applyLocalLockToTrainingData(),
  { deep: true },
);

// 트레이너 상세 페이지로 이동
const goToTrainerPage = () => {
  if (trainingData.value?.trainerId) {
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

// 루틴 상세 이동 (완료면 열람, 미완료면 응시)
const goToRoutineDetail = (quest) => {
  if (!quest?.id) {
    console.error("❌ 루틴 ID가 존재하지 않음:", quest);
    return;
  }
  const base = `/trainee/mypage/training/${route.params.trainingId}/routine/${quest.id}`;
  if (quest.completed) {
    router.push(base); // 열람 모드
  } else {
    const eid = enrollmentStore.enrollmentId;
    if (eid)
      router.push(`${base}?enrollmentId=${eid}`); // 응시 모드
    else router.push(base); // 비정상 케이스 대비
  }
};

// 1:1 PT 채팅
const goToPtPage = async () => {
  try {
    const traineeId = authStore.user?.userId;
    const trainingIdNum = Number(route.params.trainingId);
    const response = await createCounseling(trainingIdNum, traineeId);
    const roomId = response.data.data.roomId;
    router.push(`/common/pt-chat/${roomId}`);
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

const showReviewButton = computed(() => {
  return areAllQuestsComplete.value || isTrainingExpired.value;
});

const showChatButton = computed(() => {
  return areAllQuestsComplete.value;
});

// 다른 사람이 추가한 startChat 유지
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
      <div class="space-y-4">
        <!-- 스트레칭 섹션 -->
        <div class="space-y-1">
          <p class="pb-1 pl-1 text-sm text-gray-500">금융 익히기</p>
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
        </div>

        <!-- 근력 섹션 -->
        <div class="space-y-1">
          <p class="pb-1 pl-1 text-sm text-gray-500">금융 근력 키우기</p>
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
        </div>

        <!-- 유산소 섹션 -->
        <div class="space-y-1">
          <p class="pb-1 pl-1 text-sm text-gray-500">금융 체력 기르기</p>
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
          :disabled="chatRoomCreated"
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
