<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getRoutineDetail } from "@/composables/api/trainee/training/routineDetailAPI";
import { submitRoutineResult } from "@/composables/api/trainee/training/routineResultAPI";
import { useEnrollmentStore } from "@/stores/enrollment";
import { watch } from "vue";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import RoutineSubmitBar from "@/components/trainee/training/RoutineSubmitBar.vue";
import RoutineChat from "@/components/trainee/training/RoutineChat.vue";
import RoutineVideo from "@/components/trainee/training/RoutineVideo.vue";
import RoutineResultModal from "@/components/trainee/training/RoutineResultModal.vue";

const router = useRouter();
const route = useRoute();
const enrollmentStore = useEnrollmentStore();

// API 데이터 상태
const currentRoutine = ref(null);

// AI 채팅/인증 상태
const certificationPhotos = ref([]);
const isLoading = ref(false);
const isResultModalVisible = ref(false);
const submissionStatus = ref("success");
const acquiredReward = ref(0);

// API 호출 → 루틴 상세 로드
const loadRoutineDetail = async () => {
  try {
    const res = await getRoutineDetail(route.params.routineId);
    const raw = res.data;

    currentRoutine.value = {
      id: route.params.routineId,
      title: raw.routineTitle,
      description: raw.routineDescription,
      level: raw.level,
      category: raw.category,
      reward: raw.routineScore,
      videoUrl: raw.routineVideoUrl || null,
      completed: false,
    };
  } catch (err) {
    console.error(" 루틴 상세 조회 실패:", err);
    router.back();
  }
};

onMounted(() => {
  if (!route.query.enrollmentId && enrollmentStore.enrollmentId) {
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        enrollmentId: enrollmentStore.enrollmentId,
      },
    });
  }
});
watch(
  () => route.query.enrollmentId,
  async (val) => {
    if (val) {
      await loadRoutineDetail();
    }
  },
  { immediate: true },
);

// 뒤로 가기
const handleGoBack = () => router.back();

// 영상 열기
const openVideo = () => {
  if (currentRoutine.value?.videoUrl) {
    window.open(currentRoutine.value.videoUrl, "_blank");
  }
};

// 제출 처리 (AI 판별 or API 검증 로직 연결 예정)
const handleCertificationSubmit = async (submission) => {
  if (isLoading.value) return;
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
// 모달 닫기
const closeModal = () => {
  isResultModalVisible.value = false;
  if (submissionStatus.value === "success") {
    currentRoutine.value.completed = true;
    router.back();
  }
};

// 재시도
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

    <RoutineSubmitBar
      :is-loading="isLoading"
      @submit="handleCertificationSubmit"
    />

    <RoutineResultModal
      :is-visible="isResultModalVisible"
      :status="submissionStatus"
      :reward="acquiredReward"
      @close="closeModal"
      @retry="retrySubmission"
    />
  </div>
</template>
