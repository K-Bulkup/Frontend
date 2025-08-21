<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getRoutineDetail } from "@/composables/api/trainee/training/routineDetailAPI";
import {
  submitRoutineResult,
  getUserAnswer,
} from "@/composables/api/trainee/training/routineResultAPI";
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
const failCommentary = ref("");
const isLocked = ref(false);

// ✅ 모달/이전 제출 상태
const extractedAnswer = ref(""); // 문자열(텍스트 or 이미지 URL)
const extractedAnswerIsText = ref(true);
const previousAnswer = ref("");
const previousAnswerIsText = ref(true);
const previousAnswerAt = ref(null);
const previousAnswerIsPass = ref(null);

const isEntryMode = computed(
  () => !!route.query.enrollmentId && !isLocked.value,
);

// 타입 정규화
const normalizeRoutineType = (t) => {
  const s = String(t ?? "")
    .trim()
    .toUpperCase();
  if (/주관/.test(s)) return "SUBJECTIVE";
  if (/^OX$|TRUE|FALSE|T\/F|O\/X/.test(s)) return "OX";
  if (
    /실천|행동|실습|연습|PRACT|PRACTICE|PRACTICAL|ACTION|TASK|EXER(CISE)?|ACTIVITY|BEHAVIOR|PHOTO|IMAGE|PICTURE|UPLOAD|EVIDENCE/.test(
      s,
    )
  )
    return "PRACTICE";
  if (/(SUBJ|SUBJECT|SUBJECTIVE|ESSAY|TEXT|SHORT_?ANSWER)/.test(s))
    return "SUBJECTIVE";
  if (/^(OX|TRUE_FALSE|TF|BINARY)$/.test(s)) return "OX";
  if (
    /실천|행동|실습|연습|PRACT|PRACTICE|PRACTICAL|ACTION|TASK|EXER(CISE)?|ACTIVITY|BEHAVIOR/.test(
      s,
    )
  )
    return "PRACTICE";
  const n = Number(s);
  if (!Number.isNaN(n))
    return n === 1
      ? "SUBJECTIVE"
      : n === 2
        ? "OX"
        : n === 3
          ? "PRACTICE"
          : "SUBJECTIVE";
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
const groupIcon = computed(() =>
  routineGroup.value === "근력"
    ? IconStrength
    : routineGroup.value === "유산소"
      ? IconCardio
      : IconStretch,
);

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
  return false;
};

// ✅ 답안 + 타입 추출 (text=false면 이미지)
const pickAnswerAndType = (r) => {
  const d = r?.data ?? r;
  const ans = String(
    d?.answer ?? d?.extractedAnswer ?? d?.recognizedText ?? d?.answerText ?? "",
  ).trim();
  let isText = d?.text;
  if (typeof isText !== "boolean") {
    // 서버에서 text 여부를 주지 않는 경우 URL 확장자로 추정
    isText = !/^https?:\/\/.+\.(png|jpe?g|gif|webp|bmp|heic|heif)$/i.test(ans);
  }
  return { ans, isText };
};

const clearAllScopesFor = (routineId) => {
  const ctxE = scopeCtx(routineId);
  const ctxT = { ...ctxE, enrollmentId: null };
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

  // ✅ 기존 제출 이력 조회
  try {
    const trainingId = route.params.trainingId;
    const routineId = route.params.routineId;
    const res = await getUserAnswer(trainingId, routineId);
    const ua = res?.data ?? res;

    const { ans, isText } = pickAnswerAndType(ua);
    previousAnswer.value = ans;
    previousAnswerIsText.value = !!isText;
    previousAnswerIsPass.value = normalizePassResult(ua);
    previousAnswerAt.value =
      ua?.submittedAt ?? ua?.createdAt ?? ua?.timestamp ?? null;

    console.log("✅ UserAnswerDTO:", ua);
  } catch (e) {
    console.error("❌ getUserAnswer 실패:", e);
  }

  // 기존 Lock 전환 로직
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
    console.log("res : ", res);

    // ✅ 모달용 answer 저장 (타입 포함)
    const { ans, isText } = pickAnswerAndType(res);
    extractedAnswer.value = ans;
    extractedAnswerIsText.value = !!isText;

    const passed = normalizePassResult(res);
    submissionStatus.value = passed ? "success" : "failure";

    const serverComment = res?.data?.commentary ?? res?.data?.comment ?? "";
    failCommentary.value = passed ? "" : String(serverComment).trim();

    clearAllScopesFor(id);

    if (passed) {
      routineLock.lock(scopeCtx(id));
      isLocked.value = true;
      currentRoutine.value.completed = true;
      acquiredReward.value = currentRoutine.value.reward;

      if (route.query.enrollmentId) {
        const { enrollmentId, ...rest } = route.query;
        router.replace({ path: route.path, query: rest });
      }
    } else {
      isLocked.value = false;
      currentRoutine.value.completed = false;
      acquiredReward.value = 0;

      // ✅ 직전 제출을 "이전 오답"으로 반영 (타입 포함)
      previousAnswer.value = ans;
      previousAnswerIsText.value = !!isText;
      previousAnswerIsPass.value = false;
      previousAnswerAt.value = new Date().toISOString();
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
const closeResult = (reason) => {
  isResultModalVisible.value = false;
  if (reason === "primary" && submissionStatus.value === "success") {
    router.replace(`/trainee/mypage/training/${route.params.trainingId}`);
  }
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
          <RoutineTypeSubjective
            v-else
            :minimal="true"
            :loading="isLoading"
            @submit="handleCertificationSubmit"
          />
        </div>

        <!-- ✅ 이전 오답 표시 (텍스트/이미지 분기) -->
        <div
          v-if="isEntryMode && previousAnswer && previousAnswerIsPass === false"
          class="mt-4 rounded-[12px] bg-[#232323] px-3 py-3 text-white"
        >
          <div class="mb-1 text-[11px] text-gray-400">이전 제출(오답)</div>
          <div v-if="previousAnswerIsText" class="break-words text-sm">
            {{ previousAnswer }}
          </div>
          <img
            v-else
            :src="previousAnswer"
            alt="이전 제출 이미지"
            class="mt-1 max-h-72 w-full rounded-lg bg-black/30 object-contain"
          />
          <div v-if="previousAnswerAt" class="mt-1 text-[11px] text-gray-500">
            {{ new Date(previousAnswerAt).toLocaleString() }}
          </div>
        </div>

        <!-- ✅ 완료된 루틴: 제출한 정답 표시 (텍스트/이미지 분기) -->
        <div
          v-else-if="isLocked"
          class="mt-8 rounded-xl bg-gray-custom px-4 py-5 text-left"
        >
          <div class="mb-1 text-[12px] text-gray-400">제출한 정답</div>
          <div
            v-if="previousAnswerIsText"
            class="break-words text-sm text-white"
          >
            {{ previousAnswer || "제출한 답안을 불러올 수 없습니다." }}
          </div>
          <img
            v-else
            :src="previousAnswer"
            alt="제출한 정답 이미지"
            class="mt-1 max-h-72 w-full rounded-lg bg-black/30 object-contain"
          />
          <div v-if="previousAnswerAt" class="mt-1 text-[11px] text-gray-500">
            {{ new Date(previousAnswerAt).toLocaleString() }}
          </div>
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

            <!-- ✅ 이전 오답 표시 (텍스트/이미지 분기) -->
            <div
              v-if="
                isEntryMode && previousAnswer && previousAnswerIsPass === false
              "
              class="mt-4 rounded-[12px] bg-[#232323] px-3 py-3 text-white"
            >
              <div class="mb-1 text-[11px] text-gray-400">이전 제출(오답)</div>
              <div v-if="previousAnswerIsText" class="break-words text-sm">
                {{ previousAnswer }}
              </div>
              <img
                v-else
                :src="previousAnswer"
                alt="이전 제출 이미지"
                class="mt-1 max-h-72 w-full rounded-lg bg-black/30 object-contain"
              />
              <div
                v-if="previousAnswerAt"
                class="mt-1 text-[11px] text-gray-500"
              >
                {{ new Date(previousAnswerAt).toLocaleString() }}
              </div>
            </div>

            <!-- ✅ 완료된 루틴: 제출한 정답 표시 (텍스트/이미지 분기) -->
            <div
              v-else-if="isLocked"
              class="mt-6 rounded-xl bg-gray-800 px-4 py-5 text-left"
            >
              <div class="mb-1 text-[12px] text-gray-400">제출한 정답</div>
              <div
                v-if="previousAnswerIsText"
                class="break-words text-sm text-white"
              >
                {{ previousAnswer || "제출한 답안을 불러올 수 없습니다." }}
              </div>
              <img
                v-else
                :src="previousAnswer"
                alt="제출한 정답 이미지"
                class="mt-1 max-h-72 w-full rounded-lg bg-black/30 object-contain"
              />
              <div
                v-if="previousAnswerAt"
                class="mt-1 text-[11px] text-gray-500"
              >
                {{ new Date(previousAnswerAt).toLocaleString() }}
              </div>
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
      :commentary="failCommentary"
      :answer="extractedAnswer"
      :answer-is-text="extractedAnswerIsText"
      @close="closeResult"
      @retry="retrySubmission"
    />
  </div>
</template>
