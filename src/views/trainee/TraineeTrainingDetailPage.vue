<script setup>
import { ref, computed, onMounted, onActivated, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useEnrollmentStore } from "@/stores/enrollment";
import {
  getTraineeTrainingDetail,
  getTraineeTrainingStatus,
} from "@/composables/api/trainee/training/traineeTrainingDetailAPI";
import { useRoutineLockStore } from "@/stores/routineLock";
import { useAuthStore } from "@/stores/auth";

import profileDefault from "@/assets/images/mascot/profile.png";
import BaseHeader from "@/components/common/BaseHeader.vue";
import TraineeRoutineSection from "@/components/trainee/training/TraineeRoutineSection.vue";
import ActionButton from "@/components/trainee/training/ActionButton.vue";
import ProgressBar from "@/components/common/ProgressBar.vue";
import StarIcon from "@/assets/images/star.svg";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const enrollmentStore = useEnrollmentStore();
const routineLock = useRoutineLockStore();

const trainingData = ref(null);
const hasWrittenReview = ref(false);
const chatRoomCreated = ref(false);
const trainingId = ref(route.params.trainingId);

const userKey = computed(() =>
  String(authStore.userId ?? authStore.user?.userId ?? "anon"),
);
const num = (v) => (v == null ? 0 : Number(v));

// 서버 Boolean도 문자열/숫자 형태가 섞일 수 있으니 안전하게 정규화
const isTrueLike = (v) =>
  v === true ||
  v === 1 ||
  v === "1" ||
  (typeof v === "string" && v.toUpperCase() === "TRUE");

/** 체크표시 기준: 서버의 completed(Boolean) **만** 신뢰 */
const convertRoutines = (routineList) =>
  routineList?.map((r, i) => {
    const serverCompleted = isTrueLike(r?.completed);
    return {
      id: String(r?.routineId ?? r?.id ?? i),
      name: r?.title ?? r?.name ?? `루틴 ${i + 1}`,
      completed: serverCompleted, // ← 체크 표시는 서버만
      routineType: r?.routineType,
      quizType: r?.quizType,
      rewardPoint: r?.rewardPoint ?? 0,
      // PASS가 아닐 땐 completedAt을 비워서 자식이 시간을 기준으로 체크하지 않게
      completedAt: serverCompleted ? (r?.completedAt ?? null) : null,
    };
  }) || [];

// 서버 호출
const loadTrainingData = async () => {
  try {
    const eidNum = Number(enrollmentStore.enrollmentId);
    const res = Number.isFinite(eidNum)
      ? await getTraineeTrainingDetail(trainingId.value, {
          enrollmentId: eidNum,
        })
      : await getTraineeTrainingDetail(trainingId.value);

    const raw = res.data.data;

    // 서버가 enrollmentId를 내려주면 저장 (다음 호출부터 파라미터 포함)
    if (raw?.enrollmentId) {
      enrollmentStore.enrollmentId = raw.enrollmentId;
    }

    trainingData.value = {
      startDate: new Date().toISOString().split("T")[0],
      trainerName:
        raw.trainerName || raw.trainerNickname || "트레이너명 준비중",
      trainerProfileUrl: raw.trainerProfileUrl || null,
      trainerId: raw.trainerId,
      trainerRating: raw.averageRating,
      studentCount: num(
        raw.traineeCount ?? raw.enrolledTraineeCount ?? raw.totalTraineeCount,
      ),
      totalWeeks: 4,
      title: raw.title,
      progress: raw.progress, // 예: 83.3
      totalReward: raw.totalScore,
      routines: {
        스트레칭: convertRoutines(raw.routines?.["스트레칭"] || []),
        근력: convertRoutines(raw.routines?.["근력"] || []),
        유산소: convertRoutines(raw.routines?.["유산소"] || []),
      },
      level: raw.level,
      category: raw.category,
    };
  } catch (err) {
    console.error("🚨 트레이닝 상세 조회 실패:", err);
  }
};

// (우리 기능과 직접 관련 없는 500은 콘솔만 찍고 무시)
const checkTrainingStatus = async () => {
  try {
    const res = await getTraineeTrainingStatus(trainingId.value);
    hasWrittenReview.value = !!res.data.data.hasWrittenReview;
    chatRoomCreated.value = !!res.data.data.chatRoomCreated;
  } catch (err) {
    // 상태 조회 실패는 UI 핵심과 무관 → 조용히 패스
    // console.debug("상태 조회 실패(무시):", err);
  }
};

onMounted(() => {
  loadTrainingData();
  checkTrainingStatus();
});
onActivated(() => {
  loadTrainingData();
});

// 루틴 상세에서 PASS → routineLock 기록 → 여기서 서버 재조회
watch(
  () => routineLock.lockedByKey,
  () => {
    loadTrainingData();
  },
  { deep: true },
);

// ----------------- 섹션 잠금/완료 판정 -----------------

// v2 스코프 컨텍스트(로컬락 조회용)
const ctxBase = computed(() => ({
  userId: userKey.value,
  trainingId: String(route.params.trainingId),
  enrollmentId: enrollmentStore.enrollmentId ?? null,
}));

// "다음 섹션 열림" 판정에서만 로컬락을 인정 (체크/진행률은 서버만)
const isDoneForUnlock = (q) =>
  !!q?.id &&
  (q.completed ||
    routineLock.isLocked({ ...ctxBase.value, routineId: String(q.id) }));

const expandedSections = ref({
  stretching: false,
  strength: false,
  cardio: false,
});

const isSectionLocked = (key) => {
  if (!trainingData.value?.routines) return false;

  const S = trainingData.value.routines["스트레칭"];
  const M = trainingData.value.routines["근력"];
  const C = trainingData.value.routines["유산소"];

  if (key === "stretching") {
    // 스트레칭은 항상 열림 (아이템 없으면 잠금)
    return !(S && S.length > 0);
  }
  if (key === "strength") {
    if (!M || M.length === 0) return true;
    if (!S || S.length === 0) return true;
    return !S.every(isDoneForUnlock); // 서버완료 ∨ 로컬락
  }
  if (key === "cardio") {
    if (!C || C.length === 0) return true;
    if (!M || M.length === 0) return true;
    return !M.every(isDoneForUnlock); // 서버완료 ∨ 로컬락
  }
  return false;
};

// 체크/진행률(서버 기준) — completed만 사용
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
const isCardioComplete = computed(
  () =>
    trainingData.value?.routines["유산소"]?.length > 0 &&
    trainingData.value.routines["유산소"].every((q) => q.completed),
);
const areAllQuestsComplete = computed(
  () =>
    isStretchingComplete.value &&
    isStrengthComplete.value &&
    isCardioComplete.value,
);

// 버튼 노출은 'UI 기준 완료'(서버완료 ∨ 로컬락) — UX 유지
const isStretchingDoneForUI = computed(() => {
  const S = trainingData.value?.routines["스트레칭"];
  return S?.length > 0 && S.every(isDoneForUnlock);
});
const isStrengthDoneForUI = computed(() => {
  const M = trainingData.value?.routines["근력"];
  return M?.length > 0 && M.every(isDoneForUnlock);
});
const isCardioDoneForUI = computed(() => {
  const C = trainingData.value?.routines["유산소"];
  return C?.length > 0 && C.every(isDoneForUnlock);
});
const areAllQuestsDoneForUI = computed(
  () =>
    isStretchingDoneForUI.value &&
    isStrengthDoneForUI.value &&
    isCardioDoneForUI.value,
);

// 이동
const goToRoutineDetail = (q) => {
  if (!q?.id) return console.error("❌ 루틴 ID가 존재하지 않음:", q);
  const base = `/trainee/mypage/training/${route.params.trainingId}/routine/${q.id}`;
  const eid = enrollmentStore.enrollmentId;
  if (q.completed)
    router.push(base); // 열람 모드
  else router.push(eid ? `${base}?enrollmentId=${eid}` : base); // 응시 모드
};

// 기간/버튼
const goToTrainerPage = () => {
  if (trainingData.value?.trainerId)
    router.push(`/trainee/trainer/${trainingData.value.trainerId}`);
  else console.error("이동할 트레이너의 ID가 없습니다.");
};
const goToReviewPage = () =>
  router.push(`/trainee/mypage/review/${route.params.trainingId}`);
const goBack = () => router.back();

const isTrainingExpired = computed(() => {
  if (!trainingData.value?.startDate) return false;
  const endDate = new Date(trainingData.value.startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  return new Date() > endDate;
});
const trainingDeadline = computed(() => {
  if (!trainingData.value?.startDate) return "";
  const d = new Date(trainingData.value.startDate);
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
});

const showReviewButton = computed(
  () => areAllQuestsDoneForUI.value || isTrainingExpired.value,
);
const showChatButton = computed(() => areAllQuestsDoneForUI.value);

const goToQnaPage = () =>
  router.push(`/trainee/mypage/training/${route.params.trainingId}/qna`);
const toggleSection = (k) => {
  expandedSections.value[k] = !expandedSections.value[k];
};
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col">
    <BaseHeader title="트레이닝 상세" @back="goBack" />

    <main v-if="trainingData" class="mx-5 flex-1">
      <div class="mb-8 mt-7 flex items-end justify-between">
        <h1 class="text-subTitle font-semibold leading-tight text-white">
          {{ trainingData.title }}
        </h1>
        <span class="shrink-0 whitespace-nowrap text-body3 text-gray-400">
          수강 종료: {{ trainingDeadline }}
        </span>
      </div>

      <div class="mb-4"><ProgressBar :value="trainingData.progress" /></div>

      <div class="mb-12 rounded-xl bg-gray-900 p-4">
        <div class="flex items-center gap-3">
          <button @click="goToTrainerPage" class="flex items-center gap-3">
            <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-700">
              <img
                v-if="trainingData.trainerProfileUrl"
                :src="trainingData.trainerProfileUrl"
                class="h-full w-full object-cover"
              />
              <img
                v-else
                :src="profileDefault"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="text-left">
              <p class="text-input font-bold text-white">
                {{ trainingData.trainerName }}
              </p>
              <p class="flex items-center gap-1 text-body2 text-gray-300">
                수강생 {{ trainingData.studentCount.toLocaleString() }}
                <img :src="StarIcon" alt="star" class="inline-block h-3 w-3" />
                {{ trainingData.trainerRating || "-" }}
              </p>
            </div>
          </button>
          <button
            @click="goToQnaPage"
            class="ml-auto rounded-full bg-primary px-3 py-1.5 text-input font-bold text-black shadow"
          >
            Q&A
          </button>
        </div>
      </div>

      <TraineeRoutineSection
        title="스트레칭"
        subtitle="준비와 기초 다지기"
        :quests="trainingData.routines['스트레칭']"
        :is-locked="isSectionLocked('stretching')"
        :is-expanded="expandedSections.stretching"
        :lock-message="'이전 섹션 완료 후 잠금 해제'"
        @toggle="expandedSections.stretching = !expandedSections.stretching"
        @routine-click="
          (q) => {
            if (!isSectionLocked('stretching')) goToRoutineDetail(q);
          }
        "
      />

      <TraineeRoutineSection
        title="근력"
        subtitle="성장을 위한 역량 축적"
        :quests="trainingData.routines['근력']"
        :is-locked="isSectionLocked('strength')"
        :is-expanded="expandedSections.strength"
        :lock-message="'스트레칭 완료 후 잠금 해제'"
        @toggle="expandedSections.strength = !expandedSections.strength"
        @routine-click="
          (q) => {
            if (!isSectionLocked('strength')) goToRoutineDetail(q);
          }
        "
      />

      <TraineeRoutineSection
        title="유산소"
        subtitle="꾸준한 관리 습관 형성"
        :quests="trainingData.routines['유산소']"
        :is-locked="isSectionLocked('cardio')"
        :is-expanded="expandedSections.cardio"
        :lock-message="'근력 완료 후 잠금 해제'"
        @toggle="expandedSections.cardio = !expandedSections.cardio"
        @routine-click="
          (q) => {
            if (!isSectionLocked('cardio')) goToRoutineDetail(q);
          }
        "
      />

      <div class="mt-10 space-y-3">
        <ActionButton
          v-if="showReviewButton"
          :text="hasWrittenReview ? '리뷰 작성 완료' : '리뷰 작성하기'"
          :variant="hasWrittenReview ? 'disabled' : 'primary'"
          :disabled="hasWrittenReview"
          @click="!hasWrittenReview && goToReviewPage()"
        />
        <ActionButton
          v-if="showChatButton"
          :text="chatRoomCreated ? '1:1 PT 예약 완료' : '1:1 PT 예약하기'"
          :variant="chatRoomCreated ? 'disabled' : 'primary'"
          :disabled="chatRoomCreated"
          @click="
            () =>
              router.push(
                `/trainee/pt/reservation/${trainingData.trainerId}/${route.params.trainingId}`,
              )
          "
        />
      </div>
    </main>
  </div>
</template>
