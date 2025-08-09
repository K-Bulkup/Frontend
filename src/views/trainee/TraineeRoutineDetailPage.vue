<script setup>
import { ref, onMounted, watch, computed } from "vue";
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

// API 데이터 상태
const currentRoutine = ref(null);

// AI 채팅/인증 상태
const certificationPhotos = ref([]);
const isLoading = ref(false);
const isResultModalVisible = ref(false);
const submissionStatus = ref("success"); // 'success' | 'failure'
const acquiredReward = ref(0);

// 잠금/입력 모드
const isLocked = ref(false); // 로컬락(정답) → true
const isEntryMode = computed(
  () => !!route.query.enrollmentId && !isLocked.value,
);

// API 호출 → 루틴 상세 로드
const loadRoutineDetail = async () => {
  try {
    const res = await getRoutineDetail(route.params.routineId);
    const raw = res.data;

    const id = route.params.routineId;
    // 서버 completed 필드가 없다면 로컬락만으로 판단
    const localLocked = routineLock.isLocked(id);

    currentRoutine.value = {
      id,
      title: raw.routineTitle,
      description: raw.routineDescription,
      level: raw.level,
      category: raw.category,
      reward: raw.routineScore,
      videoUrl: raw.routineVideoUrl || null,
      completed: localLocked, // 잠김=완료로 간주
    };
    isLocked.value = localLocked;

    // 잠금 상태인데 응시 URL로 들어왔으면 쿼리 제거하여 보기모드로
    if (isLocked.value && route.query.enrollmentId) {
      const { enrollmentId, ...rest } = route.query;
      router.replace({ path: route.path, query: rest });
    }
  } catch (err) {
    console.error(" 루틴 상세 조회 실패:", err);
    router.back();
  }
};

onMounted(async () => {
  // 응시 모드 진입(쿼리 없으면 store의 enrollmentId를 부여)
  if (!route.query.enrollmentId && enrollmentStore.enrollmentId) {
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        enrollmentId: enrollmentStore.enrollmentId,
      },
    });
  } else {
    // 보기 모드로 직접 진입한 경우도 상세 로드
    await loadRoutineDetail();
  }
});

watch(
  () => route.query.enrollmentId,
  async (val) => {
    // 응시 모드가 되면 상세 로드
    if (val) {
      await loadRoutineDetail();
    }
  },
  { immediate: false },
);

// 뒤로 가기
const handleGoBack = () => router.back();

// 영상 열기
const openVideo = () => {
  if (currentRoutine.value?.videoUrl) {
    window.open(currentRoutine.value.videoUrl, "_blank");
  }
};

// 제출 처리
const handleCertificationSubmit = async (submission) => {
  if (isLoading.value || isLocked.value) return;
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
      enrollmentId: Number(route.query.enrollmentId),
      answerText: submission.text,
      evidenceUrl: submission.imageUrl ?? null,
    });

    const result = res.data.passFailResult;

    submissionStatus.value = result === "PASS" ? "success" : "failure";
    if (result === "PASS") {
      // ✅ 즉시 잠금 + 완료 표시
      routineLock.lock(currentRoutine.value.id);
      isLocked.value = true;
      currentRoutine.value.completed = true;
      acquiredReward.value = currentRoutine.value.reward;

      // URL에서 enrollmentId 제거 → 재입력 방지(보기모드 고정)
      if (route.query.enrollmentId) {
        const { enrollmentId, ...rest } = route.query;
        router.replace({ path: route.path, query: rest });
      }
    } else {
      // 오답이면 잠금 해제 보장
      routineLock.unlock(currentRoutine.value.id);
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

// 모달 닫기 (원래 네 로직 유지: 이 페이지에 그대로 남음)
const closeModal = () => {
  isResultModalVisible.value = false;
};

// 재시도
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

    <!-- 입력창: 응시 모드일 때만 노출 -->
    <RoutineSubmitBar
      v-if="isEntryMode"
      :is-loading="isLoading"
      @submit="handleCertificationSubmit"
    />

    <!-- 보기 모드(완료됨) 안내 -->
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
