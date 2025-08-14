<script setup>
import { ref, computed, onMounted, onActivated, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useEnrollmentStore } from "@/stores/enrollment";
import {
  getTraineeTrainingDetail,
  getTraineeTrainingStatus,
} from "@/composables/api/trainee/training/traineeTrainingDetailAPI";
import { createCounseling } from "@/composables/api/useCounselingApi";
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

/** ✅ 체크/진행률 기준: 서버가 주는 '완료' 신호만 인정 */
const isServerPass = (r) => {
  const s = (r?.passFailResult ?? r?.status ?? r?.result ?? "")
    .toString()
    .toUpperCase();
  if (s === "PASS" || s === "COMPLETED" || s === "TRUE") return true;
  if (r?.status === true) return true;
  if (r?.isPassed === true) return true;
  if (r?.completed === true || r?.isCompleted === true) return true;
  return false; // ⛔ completedAt 등의 날짜는 절대 사용하지 않음
};

// 목록 루틴 매핑: 체크/진행률은 서버만 신뢰
const convertRoutines = (routineList) =>
  routineList?.map((r) => {
    const serverPass = isServerPass(r);
    return {
      id: String(r.routineId),
      name: r.title,
      serverPass,
      completed: serverPass, // ✅ 체크는 서버만
      rewardPoint: r.rewardPoint,
      completedAt: r.completedAt,
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
      studentCount: num(
        raw.traineeCount ?? raw.enrolledTraineeCount ?? raw.totalTraineeCount,
      ),
      totalWeeks: 4,
      title: raw.title,
      progress: raw.progress,
      totalReward: raw.totalScore,
      routines: {
        스트레칭: convertRoutines(raw.routines?.["스트레칭"]),
        근력: convertRoutines(raw.routines?.["근력"]),
        유산소: convertRoutines(raw.routines?.["유산소"]),
      },
      level: raw.level,
      category: raw.category,
    };
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
onActivated(() => {
  loadTrainingData();
});

// ✅ 루틴 상세에서 PASS → 로컬락 기록 → 여기 watch가 서버 재조회
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
  stretching: true,
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
    if (!M || M.length === 0) return true; // 근력 없으면 잠금
    if (!S || S.length === 0) return true; // 선행 섹션 없으면 잠금
    return !S.every(isDoneForUnlock); // ✅ 로컬락 OR 서버PASS
  }
  if (key === "cardio") {
    if (!C || C.length === 0) return true;
    if (!M || M.length === 0) return true;
    return !M.every(isDoneForUnlock); // ✅ 로컬락 OR 서버PASS
  }
  return false;
};

// ✅ 체크/진행률(서버 기준) — 기존 유지
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

// ✅ 버튼 노출은 'UI 기준 완료'(서버PASS 또는 로컬락)
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
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
});

// ⬇⬇⬇ 여기만 교체: 버튼은 UI 기준 완료로 즉시 노출
const showReviewButton = computed(
  () => areAllQuestsDoneForUI.value || isTrainingExpired.value,
);
const showChatButton = computed(() => areAllQuestsDoneForUI.value);

// Q&A/채팅
const startChat = async () => {
  try {
    const response = await createCounseling(trainingId.value, userKey.value);
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
const goToQnaPage = () =>
  router.push(`/trainee/mypage/training/${route.params.trainingId}/qna`);
const toggleSection = (k) => {
  expandedSections.value[k] = !expandedSections.value[k];
};
</script>

<template>
  <div class="flex flex-col">
    <BaseHeader title="트레이닝 상세" @back="goBack" />

    <main v-if="trainingData" class="mx-5 flex-1">
      <div class="mb-8 mt-7 flex items-end justify-between">
        <h1 class="text-subTitle font-bold leading-tight text-white">
          {{ trainingData.title }}
        </h1>
        <span class="text-body3 text-gray-400"
          >수강 종료: {{ trainingDeadline }}</span
        >
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
        subtitle="금융 익히기"
        :quests="trainingData.routines['스트레칭']"
        :is-locked="isSectionLocked('stretching')"
        :is-expanded="expandedSections.stretching"
        :lock-message="'이전 섹션 완료 후 잠금 해제'"
        @toggle="toggleSection('stretching')"
        @routine-click="
          (q) => {
            if (!isSectionLocked('stretching')) goToRoutineDetail(q);
          }
        "
      />

      <TraineeRoutineSection
        title="근력"
        subtitle="금융 근력 키우기"
        :quests="trainingData.routines['근력']"
        :is-locked="isSectionLocked('strength')"
        :is-expanded="expandedSections.strength"
        :lock-message="'스트레칭 완료 후 잠금 해제'"
        @toggle="toggleSection('strength')"
        @routine-click="
          (q) => {
            if (!isSectionLocked('strength')) goToRoutineDetail(q);
          }
        "
      />

      <TraineeRoutineSection
        title="유산소"
        subtitle="금융 체력 기르기"
        :quests="trainingData.routines['유산소']"
        :is-locked="isSectionLocked('cardio')"
        :is-expanded="expandedSections.cardio"
        :lock-message="'근력 완료 후 잠금 해제'"
        @toggle="toggleSection('cardio')"
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
          :variant="hasWrittenReview ? 'disabled' : 'secondary'"
          :disabled="hasWrittenReview"
          class="w-full bg-gray-custom !text-body !font-medium !text-white"
          @click="!hasWrittenReview && goToReviewPage()"
        />
        <ActionButton
          v-if="showChatButton"
          text="트레이너와 1:1 PT"
          variant="primary"
          :disabled="chatRoomCreated"
          class="w-full !bg-gray-custom !text-body !font-medium !text-white"
          @click="startChat"
        />
      </div>
    </main>
  </div>
</template>
