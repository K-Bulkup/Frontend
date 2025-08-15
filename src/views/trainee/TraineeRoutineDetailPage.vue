<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getRoutineDetail } from "@/composables/api/trainee/training/routineDetailAPI";
import { submitRoutineResult } from "@/composables/api/trainee/training/routineResultAPI";
import { useEnrollmentStore } from "@/stores/enrollment";
import { useRoutineLockStore } from "@/stores/routineLock";
import { useAuthStore } from "@/stores/auth";

import BaseHeader from "@/components/common/BaseHeader.vue";
import RoutineChat from "@/components/trainee/training/RoutineChat.vue";
import RoutineVideo from "@/components/trainee/training/RoutineVideo.vue";
import RoutineResultModal from "@/components/trainee/training/RoutineResultModal.vue";

import RoutineTypeSubjective from "@/components/trainee/training/RoutineTypeSubjective.vue";
import RoutineTypeOX from "@/components/trainee/training/RoutineTypeOX.vue";
import RoutineTypePractice from "@/components/trainee/training/RoutineTypePractice.vue";

// 카테고리 아이콘
import IconStretch from "@/assets/images/mascot/routine/Geumyuk_stretching.png";
import IconStrength from "@/assets/images/mascot/routine/Geumyuk_strength.png";
import IconCardio from "@/assets/images/mascot/routine/Geumyuk_cardio.png";

const router = useRouter();
const route = useRoute();
const enrollmentStore = useEnrollmentStore();
const routineLock = useRoutineLockStore();
const authStore = useAuthStore();

const currentRoutine = ref(null);
const certificationPhotos = ref([]);
const isLoading = ref(false);
const isResultModalVisible = ref(false);
const submissionStatus = ref("success");
const acquiredReward = ref(0);

const isLocked = ref(false);
const isEntryMode = computed(
  () => !!route.query.enrollmentId && !isLocked.value,
);

// ✅ 타입 정규화(영문/한글/숫자코드/변형 전부 흡수)
const normalizeRoutineType = (t) => {
  const s = String(t ?? "")
    .trim()
    .toUpperCase();

  // 한글 우선 처리
  if (/주관/.test(s)) return "SUBJECTIVE";
  if (/^OX$|TRUE|FALSE|T\/F|O\/X/.test(s)) return "OX";
  // PHOTO(=사진 인증)도 실천형으로 취급
  if (
    /실천|행동|실습|연습|PRACT|PRACTICE|PRACTICAL|ACTION|TASK|EXER(CISE)?|ACTIVITY|BEHAVIOR|PHOTO|IMAGE|PICTURE|UPLOAD|EVIDENCE/.test(
      s,
    )
  )
    return "PRACTICE";

  // 영문/코드 처리
  if (/(SUBJ|SUBJECT|SUBJECTIVE|ESSAY|TEXT|SHORT_?ANSWER)/.test(s))
    return "SUBJECTIVE";
  if (/^(OX|TRUE_FALSE|TF|BINARY)$/.test(s)) return "OX";
  // PRACTICE 변형을 더 포괄
  if (
    /실천|행동|실습|연습|PRACT|PRACTICE|PRACTICAL|ACTION|TASK|EXER(CISE)?|ACTIVITY|BEHAVIOR/.test(
      s,
    )
  )
    return "PRACTICE";

  // 숫자 코드(예: 1=주관식, 2=OX, 3=실천형 가정)
  const n = Number(s);
  if (!Number.isNaN(n)) {
    if (n === 1) return "SUBJECTIVE";
    if (n === 2) return "OX";
    if (n === 3) return "PRACTICE";
  }

  // 모르면 안전하게 주관식
  return "SUBJECTIVE";
};

const routineType = computed(() =>
  normalizeRoutineType(currentRoutine.value?.type ?? "SUBJECTIVE"),
);
const isSubjective = computed(() => routineType.value === "SUBJECTIVE");
const isOX = computed(() => routineType.value === "OX");
const isPractice = computed(() => routineType.value === "PRACTICE");
const typeLabel = computed(() =>
  isOX.value ? "OX" : isPractice.value ? "실천형" : "주관식",
);

const routineGroup = computed(() => {
  const raw = String(
    route.query.group || currentRoutine.value?.category || "",
  ).trim();
  if (/근력/.test(raw)) return "근력";
  if (/유산소/.test(raw)) return "유산소";
  return "스트레칭";
});

const groupIcon = computed(() => {
  switch (routineGroup.value) {
    case "근력":
      return IconStrength;
    case "유산소":
      return IconCardio;
    case "스트레칭":
    default:
      return IconStretch;
  }
});

// v2 스코프 컨텍스트
const userKey = computed(() =>
  String(authStore.userId ?? authStore.user?.userId ?? "anon"),
);
const scopeCtx = (routineId) => ({
  routineId: String(routineId),
  userId: userKey.value,
  trainingId: String(route.params.trainingId),
  enrollmentId:
    Number(route.query.enrollmentId || enrollmentStore.enrollmentId) || null,
});

/* =======================
   ✅ PASS 판정 & 스코프 정리 유틸
   ======================= */
// 서버 PASS 판정 (COMPLETED 류는 제외)
const normalizePassResult = (apiRes) => {
  const r = apiRes?.data ?? apiRes;
  const s = String(r?.passFailResult ?? r?.result ?? "")
    .trim()
    .toUpperCase();

  const trueish = new Set([
    "PASS",
    "PASSED",
    "SUCCESS",
    "CORRECT",
    "TRUE",
    "Y",
    "T",
    "1",
  ]);
  if (trueish.has(s)) return true;

  const boolKeys = [
    "isPassed",
    "isPass",
    "passed",
    "pass",
    "correct",
    "isCorrect",
    "success",
  ];
  if (boolKeys.some((k) => r?.[k] === true || r?.[k] === 1)) return true;

  // 'COMPLETED' 같은 시도 상태는 PASS 아님
  return false;
};

// 같은 루틴의 모든 스코프 잠금 정리 (과거 tr 스코프 잔여 제거)
const clearAllScopesFor = (routineId) => {
  const ctxE = scopeCtx(routineId); // enr:enrollmentId
  const ctxT = { ...ctxE, enrollmentId: null }; // tr:trainingId
  routineLock.unlock(ctxE);
  routineLock.unlock(ctxT);
};

const loadRoutineDetail = async () => {
  try {
    const res = await getRoutineDetail(route.params.routineId);
    const raw = res.data;

    const id = String(route.params.routineId);
    const localLocked = routineLock.isLocked(scopeCtx(id));

    currentRoutine.value = {
      id,
      title: raw.routineTitle,
      description: raw.routineDescription,
      level: raw.level,
      category: raw.routineType,
      reward: raw.routineScore,
      videoUrl: raw.routineVideoUrl || null,
      // ⛔ 쿼리 폴백 제거: 서버 값만 신뢰
      type: normalizeRoutineType(raw.quizType),
      quizType: raw.quizType,
      completed: localLocked,
    };
    isLocked.value = localLocked;

    if (isLocked.value && route.query.enrollmentId) {
      const { enrollmentId, ...rest } = route.query;
      router.replace({ path: route.path, query: rest });
    }
  } catch (err) {
    console.error("루틴 상세 조회 실패:", err);
    router.back();
  }
};

onMounted(async () => {
  if (!route.query.enrollmentId && enrollmentStore.enrollmentId) {
    router.replace({
      path: route.path,
      query: { ...route.query, enrollmentId: enrollmentStore.enrollmentId },
    });
  } else {
    await loadRoutineDetail();
  }

  // 과거 tr 스코프만 잠겨있던 경우 enr 스코프로 이관
  try {
    const id = String(route.params.routineId);
    const ctxE = scopeCtx(id);
    const ctxT = { ...ctxE, enrollmentId: null };
    if (!routineLock.isLocked(ctxE) && routineLock.isLocked(ctxT)) {
      routineLock.unlock(ctxT);
      routineLock.lock(ctxE);
      isLocked.value = true;
      currentRoutine.value && (currentRoutine.value.completed = true);
    }
  } catch {}
});

watch(
  () => route.query.enrollmentId,
  async (v) => {
    if (v) await loadRoutineDetail();
  },
);

const handleGoBack = () => router.back();
const openVideo = () => {
  if (currentRoutine.value?.videoUrl)
    window.open(currentRoutine.value.videoUrl, "_blank");
};

const handleCertificationSubmit = async (submission) => {
  if (isLoading.value || isLocked.value) return;
  isLoading.value = true;

  const file = submission?.imageFile ?? submission?.file ?? null;
  const previewUrl = file
    ? URL.createObjectURL(file)
    : (submission?.imageUrl ?? null);

  certificationPhotos.value.push({
    id: Date.now(),
    description: submission.text,
    imageUrl: previewUrl,
    timestamp: new Date(),
    isUser: true,
  });

  try {
    const id = String(route.params.routineId);
    const payload = {
      enrollmentId: Number(route.query.enrollmentId),
      answerText: submission.text,
    };

    const res = await submitRoutineResult(id, payload, file);

    // ✅ 안전한 PASS 판정
    const passed = normalizePassResult(res);
    submissionStatus.value = passed ? "success" : "failure";

    // ✅ 스코프 정리: 과거 tr 스코프 잔여 제거
    clearAllScopesFor(id);

    if (passed) {
      // 성공: enr 스코프만 잠금
      routineLock.lock(scopeCtx(id));
      isLocked.value = true;
      currentRoutine.value.completed = true;
      acquiredReward.value = currentRoutine.value.reward;

      // 응시 모드 종료(쿼리 정리)
      if (route.query.enrollmentId) {
        const { enrollmentId, ...rest } = route.query;
        router.replace({ path: route.path, query: rest });
      }
    } else {
      // 실패: 어떤 스코프에도 잠금 없도록 보장
      isLocked.value = false;
      currentRoutine.value.completed = false;
      acquiredReward.value = 0;
    }
  } catch (e) {
    console.error("루틴 제출 실패", e);
    submissionStatus.value = "failure";
    acquiredReward.value = 0;
  } finally {
    isLoading.value = false;
    isResultModalVisible.value = true;
  }
};

const closeModal = () => router.back();
const closeResult = () => {
  isResultModalVisible.value = false;
};
const retrySubmission = () => {
  isResultModalVisible.value = false;
};
</script>

<template>
  <div class="flex h-screen flex-col bg-realBlack">
    <header class="flex-shrink-0 px-6 pt-4">
      <BaseHeader title="루틴 상세" @back="handleGoBack" />
    </header>

    <main
      v-if="currentRoutine"
      class="relative flex-1 overflow-y-auto px-6 pb-24 pt-4 scrollbar-hide"
    >
      <!-- 1) 영상 있는 케이스 -->
      <template v-if="currentRoutine.videoUrl">
        <div class="mb-6">
          <div class="mb-1 mt-2 flex items-center gap-2">
            <h2 class="text-subTtile2 mb-0.5 mt-0.5 font-bold text-white">
              {{ currentRoutine.title }}
            </h2>
            <span
              class="rounded-full bg-[#3A3A3A] px-2 py-[2px] text-[11px] leading-none text-white"
              >{{ typeLabel }}</span
            >
          </div>
          <p class="text-body text-gray-300">
            {{ currentRoutine.description }}
          </p>
        </div>

        <RoutineVideo
          :video-url="currentRoutine.videoUrl"
          :show-label="false"
          class="mb-8"
          @play="openVideo"
        />

        <div v-if="isEntryMode" class="space-y-8">
          <RoutineTypeSubjective
            v-if="isSubjective"
            :minimal="true"
            :loading="isLoading"
            @submit="handleCertificationSubmit"
          />
          <RoutineTypeOX
            v-else-if="isOX"
            :minimal="true"
            :loading="isLoading"
            @submit="handleCertificationSubmit"
          />
          <RoutineTypePractice
            v-else-if="isPractice"
            :minimal="true"
            :loading="isLoading"
            @submit="handleCertificationSubmit"
          />
          <!-- 모르는 타입은 주관식 폴백 -->
          <RoutineTypeSubjective
            v-else
            :minimal="true"
            :loading="isLoading"
            @submit="handleCertificationSubmit"
          />
        </div>

        <div
          v-else-if="isLocked"
          class="mt-8 rounded-xl bg-gray-custom px-4 py-5 text-center text-gray-500"
        >
          이미 완료된 루틴입니다.
        </div>
      </template>

      <!-- 2) 영상 없는 케이스 -->
      <template v-else>
        <div
          class="fixed inset-0 z-20 flex items-center justify-center bg-realBlack px-6"
        >
          <div
            class="w-full max-w-[340px] rounded-[16px] bg-[#1A1A1A] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
          >
            <div class="flex items-start gap-3">
              <img
                :src="groupIcon"
                alt="routine-icon"
                class="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
              />
              <div class="min-w-0 flex-1">
                <h2 class="text-heading font-bold text-white">
                  {{ currentRoutine.title }}
                </h2>
                <div class="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    class="rounded-full bg-[#2F2F2F] px-2 py-[2px] text-[11px] leading-none text-white"
                    >{{ routineGroup }}</span
                  >
                  <span
                    class="rounded-full bg-[#3A3A3A] px-2 py-[2px] text-[11px] leading-none text-white"
                    >{{ typeLabel }}</span
                  >
                </div>
              </div>
              <button
                class="ml-1 rounded-full p-1 text-gray-400 transition hover:text-white"
                @click="closeModal"
                aria-label="close"
              >
                ✕
              </button>
            </div>

            <p class="mt-4 text-gray-300">{{ currentRoutine.description }}</p>

            <div v-if="isEntryMode" class="mt-6 space-y-6">
              <RoutineTypeSubjective
                v-if="isSubjective"
                :minimal="true"
                :loading="isLoading"
                @submit="handleCertificationSubmit"
              />
              <RoutineTypeOX
                v-else-if="isOX"
                :minimal="true"
                :loading="isLoading"
                @submit="handleCertificationSubmit"
              />
              <RoutineTypePractice
                v-else-if="isPractice"
                :minimal="true"
                :loading="isLoading"
                @submit="handleCertificationSubmit"
              />
              <RoutineTypeSubjective
                v-else
                :minimal="true"
                :loading="isLoading"
                @submit="handleCertificationSubmit"
              />
            </div>

            <div
              v-else-if="isLocked"
              class="mt-6 rounded-xl bg-gray-800 px-4 py-5 text-center text-gray-300"
            >
              이미 완료된 루틴입니다.
            </div>
          </div>
        </div>
      </template>

      <div
        v-if="certificationPhotos.length"
        class="mt-8 flex flex-col items-end space-y-3"
      >
        <RoutineChat
          v-for="photo in certificationPhotos"
          :key="photo.id"
          :photo="photo"
        />
      </div>
    </main>

    <RoutineResultModal
      :is-visible="isResultModalVisible"
      :status="submissionStatus"
      :reward="acquiredReward"
      @close="closeResult"
      @retry="retrySubmission"
    />
  </div>
</template>
