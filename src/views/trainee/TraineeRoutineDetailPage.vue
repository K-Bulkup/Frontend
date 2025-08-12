<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getRoutineDetail } from "@/composables/api/trainee/training/routineDetailAPI";
import { submitRoutineResult } from "@/composables/api/trainee/training/routineResultAPI";
import { useEnrollmentStore } from "@/stores/enrollment";
import { useRoutineLockStore } from "@/stores/routineLock";

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

const routineType = computed(() => currentRoutine.value?.type || "SUBJECTIVE");
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
    default:
      return IconStretch;
  }
});

const loadRoutineDetail = async () => {
  try {
    const res = await getRoutineDetail(route.params.routineId);
    const raw = res.data;

    const id = String(route.params.routineId);
    const localLocked = routineLock.isLocked(id);

    currentRoutine.value = {
      id,
      title: raw.routineTitle,
      description: raw.routineDescription,
      level: raw.level,
      category: raw.category,
      reward: raw.routineScore,
      videoUrl: raw.routineVideoUrl || null,
      type: String(
        raw.routineType ?? route.query.type ?? "SUBJECTIVE",
      ).toUpperCase(),
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
    const result = res.data.passFailResult;

    submissionStatus.value = result === "PASS" ? "success" : "failure";

    if (result === "PASS") {
      routineLock.lock(id);
      isLocked.value = true;
      currentRoutine.value.completed = true;
      acquiredReward.value = currentRoutine.value.reward;

      if (route.query.enrollmentId) {
        const { enrollmentId, ...rest } = route.query;
        router.replace({ path: route.path, query: rest });
      }
    } else {
      routineLock.unlock(id);
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
            >
              {{ typeLabel }}
            </span>
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
            v-else
            :minimal="true"
            :loading="isLoading"
            @submit="handleCertificationSubmit"
          />
        </div>
        <div
          v-else-if="isLocked"
          class="bg-gray-custom mt-8 rounded-xl px-4 py-5 text-center text-gray-500"
        >
          이미 완료된 루틴입니다.
        </div>
      </template>

      <!-- 2) 영상 없는 케이스: 배경 풀블랙 -->
      <template v-else>
        <!-- 여기만 변경: bg-black/70 → bg-realBlack -->
        <div
          class="fixed inset-0 z-20 flex items-center justify-center bg-realBlack px-6"
        >
          <div
            class="w-full max-w-[340px] rounded-[16px] bg-[#1A1A1A] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
          >
            <!-- 상단 -->
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

            <!-- 설명 -->
            <p class="mt-4 text-gray-300">{{ currentRoutine.description }}</p>

            <!-- 입력폼 (라벨 없음) -->
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

      <!-- 인증 채팅 피드 -->
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
