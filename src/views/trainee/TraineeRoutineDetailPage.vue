<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getRoutineDetail } from "@/composables/api/trainee/training/routineDetailAPI";
import { submitRoutineResult } from "@/composables/api/trainee/training/routineResultAPI";
import { useEnrollmentStore } from "@/stores/enrollment";
import { useRoutineLockStore } from "@/stores/routineLock";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import RoutineSubmitBar from "@/components/trainee/training/RoutineSubmitBar.vue";
import RoutineChat from "@/components/trainee/training/RoutineChat.vue";
import RoutineVideo from "@/components/trainee/training/RoutineVideo.vue";
import RoutineResultModal from "@/components/trainee/training/RoutineResultModal.vue";

const router = useRouter();
const route = useRoute();
const enrollmentStore = useEnrollmentStore();
const routineLock = useRoutineLockStore();

const currentRoutine = ref(null);
const certificationPhotos = ref([]);
const isLoading = ref(false);
const isResultModalVisible = ref(false);
const submissionStatus = ref(null); // 'success' | 'failure' | null
const isLocked = ref(false); // 보기모드(잠금)
const acquiredReward = ref(0);

// 입력창: 쿼리에 enrollmentId 있고, 잠금이 아닐 때만
const isEntryMode = computed(
  () => !!route.query.enrollmentId && !isLocked.value,
);

const normalizeCompleted = (raw) =>
  raw?.latestResult === "PASS" ||
  raw?.completed === "PASS" ||
  raw?.completed === true;

const safeEnrollmentId = () => {
  const eidRaw = route.query.enrollmentId ?? enrollmentStore.enrollmentId;
  if (eidRaw == null) return undefined;
  const n = Number(eidRaw);
  return Number.isFinite(n) ? n : undefined;
};

const loadRoutineDetail = async () => {
  try {
    const eid = safeEnrollmentId();
    const res = await getRoutineDetail(
      route.params.routineId,
      eid !== undefined ? { enrollmentId: eid } : undefined,
    );
    const raw = res.data;

    const serverCompleted = normalizeCompleted(raw);
    const id = route.params.routineId;

    currentRoutine.value = {
      id,
      title: raw.routineTitle,
      description: raw.routineDescription,
      level: raw.level,
      category: raw.category,
      reward: raw.routineScore,
      videoUrl: raw.routineVideoUrl || null,
      // ✅ 서버 or 로컬락 중 하나라도 true면 완료로 간주 (잠김=완료)
      completed: serverCompleted || routineLock.isLocked(id),
    };

    isLocked.value = currentRoutine.value.completed;

    // 완료 상태로 응시 URL로 들어왔으면 바로 열람 모드로 전환(쿼리 제거)
    if (isLocked.value && route.query.enrollmentId) {
      const { enrollmentId, ...rest } = route.query;
      router.replace({ path: route.path, query: rest });
    }
  } catch (err) {
    console.error("루틴 상세 조회 실패:", err);
    // router.back() 금지: 에러로 튕김 방지
  }
};

// 최초 진입
onMounted(() => {
  if (!route.query.enrollmentId && enrollmentStore.enrollmentId) {
    router.replace({
      path: route.path,
      query: { ...route.query, enrollmentId: enrollmentStore.enrollmentId },
    });
    return; // replace 이후 watch가 로드 호출
  }
  loadRoutineDetail(); // 보기 모드로 직접 진입해도 로드
});

// 쿼리(enrollmentId) 변경 시 로드
watch(
  () => route.query.enrollmentId,
  async (val) => {
    if (val) await loadRoutineDetail();
  },
  { immediate: true },
);

const handleGoBack = () => router.back();

const openVideo = () => {
  if (currentRoutine.value?.videoUrl)
    window.open(currentRoutine.value.videoUrl, "_blank");
};

const handleCertificationSubmit = async (submission) => {
  if (isLocked.value || isLoading.value) return;

  const eid = safeEnrollmentId();
  if (eid === undefined || !route.query.enrollmentId) {
    console.warn("응시 모드가 아님(enrollmentId 없음) → 제출 차단");
    return;
  }

  isLoading.value = true;

  certificationPhotos.value.push({
    id: Date.now(),
    description: submission.text,
    imageUrl: submission.imageUrl,
    timestamp: new Date(),
    isUser: true,
  });

  try {
    const res = await submitRoutineResult(currentRoutine.value.id, {
      enrollmentId: eid,
      answerText: submission.text,
      evidenceUrl: submission.imageUrl ?? null,
    });

    const result = res.data?.passFailResult; // "PASS" | "FAIL"
    submissionStatus.value = result === "PASS" ? "success" : "failure";

    if (result === "PASS") {
      // ✅ 로컬 잠금 저장 → 다른 페이지 갔다 와도 & 새로고침해도 계속 잠금
      routineLock.lock(currentRoutine.value.id);
      currentRoutine.value.completed = true;
      isLocked.value = true;

      // URL 쿼리 제거 → 보기모드 고정
      if (route.query.enrollmentId) {
        const { enrollmentId, ...rest } = route.query;
        router.replace({ path: route.path, query: rest });
      }
    } else {
      routineLock.unlock(currentRoutine.value.id);
      currentRoutine.value.completed = false;
      isLocked.value = false;
    }

    acquiredReward.value = result === "PASS" ? currentRoutine.value.reward : 0;
  } catch (e) {
    console.error("루틴 제출 실패", e);
    submissionStatus.value = "failure";
    acquiredReward.value = 0;
  } finally {
    isLoading.value = false;
    isResultModalVisible.value = true;
  }
};

const closeModal = () => {
  isResultModalVisible.value = false;
};

const retrySubmission = () => {
  isResultModalVisible.value = false;
};
</script>

<template>
  <div class="flex h-screen flex-col bg-realBlack pb-40">
    <header class="flex-shrink-0 px-6 pt-4">
      <BaseHeader title="루틴 상세" @back="handleGoBack" />
    </header>

    <main
      v-if="currentRoutine"
      class="flex-1 overflow-y-auto px-6 pb-40 pt-4 scrollbar-hide"
    >
      <div class="mt-4 flex items-center gap-2">
        <BaseBadge>{{ currentRoutine.level }}</BaseBadge>
        <BaseBadge>{{ currentRoutine.category }}</BaseBadge>
        <BaseBadge variant="primary" class="ml-auto">
          리워드 {{ currentRoutine.reward }}P
        </BaseBadge>
      </div>

      <RoutineVideo :video-url="currentRoutine.videoUrl" @play="openVideo" />

      <h3 class="mb-4 mt-8 text-heading text-white">현재 루틴</h3>
      <div class="mb-6 rounded-xl bg-white p-4">
        <h3 class="mb-2 text-body font-bold text-realBlack">
          {{ currentRoutine.title }}
        </h3>
        <p class="text-subtext leading-relaxed text-gray-700">
          {{ currentRoutine.description }}
        </p>
      </div>

      <div class="flex flex-col items-end space-y-3">
        <RoutineChat
          v-for="photo in certificationPhotos"
          :key="photo.id"
          :photo="photo"
        />
      </div>
    </main>

    <!-- 응시 모드일 때만 입력창 노출 -->
    <RoutineSubmitBar
      v-if="isEntryMode"
      :is-loading="isLoading"
      @submit="handleCertificationSubmit"
    />

    <!-- 열람 모드(완료됨) 안내 -->
    <div
      v-else-if="isLocked"
      class="mx-6 mb-6 rounded-xl bg-[#2A2A2A] px-4 py-6 text-center text-white/70"
    >
      이미 완료된 루틴입니다.
    </div>

    <RoutineResultModal
      :is-visible="isResultModalVisible"
      :status="submissionStatus"
      :reward="acquiredReward"
      @close="closeModal"
      @retry="retrySubmission"
    />
  </div>
</template>
