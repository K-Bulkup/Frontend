<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import badgeIcon from "@/assets/images/trainer/mypage/badge.png";
import starIcon from "@/assets/images/star.svg";
import profileDefault from "@/assets/images/mascot/profile.png";

import BaseHeader from "@/components/common/BaseHeader.vue";
import TrainerCareerDisplay from "@/components/trainee/trainer/TrainerCareerDisplay.vue";
import TrainingList from "@/components/trainee/trainer/TrainingList.vue";

import { traineeTrainerApi } from "@/composables/api/trainee/trainer/traineeTrainerApi";

// 라우팅 관련
const route = useRoute();
const router = useRouter();

// 트레이너 기본 데이터
const trainerData = reactive({
  username: "트레이너",
  userProfileUrl: profileDefault,
  career: "",
  certificates: [],
  totalTraineeCount: 0,
  totalAverageRating: 0.0,
});

const trainingList = ref([]);
const showTooltip = ref(false);

// 트레이너 정보 + 트레이닝 목록 불러오기
const fetchTrainerDetail = async () => {
  try {
    const trainerId = route.params.trainerId;
    const response = await traineeTrainerApi.getTrainerInfo(trainerId);

    const trainer = response.data.data.trainer;
    const trainings = response.data.data.trainings;

    trainerData.username = trainer.name;
    trainerData.userProfileUrl = trainer.profileUrl || profileDefault;
    trainerData.career = trainer.description;
    trainerData.totalTraineeCount = trainer.traineeCount;
    trainerData.totalAverageRating = trainer.averageRating;
    trainerData.certificates = trainer.isCertified ? ["자격증 있음"] : [];

    trainingList.value = trainings;
  } catch (error) {
    console.error("트레이너 정보 전체 조회 실패:", error);
  }
};

onMounted(() => {
  fetchTrainerDetail();
});

// 뒤로 가기
const handleGoBack = () => router.back();

// 강의 클릭 시 이동 (결제 전/후에 따른 이동 수정 필요)
const goToTrainingDetail = (trainingId) => {
  router.push(`/trainee/mypage/training/${trainingId}`);
};
</script>

<template>
  <div class="min-h-screen pb-10 pt-4 text-white">
    <BaseHeader title="트레이너 상세" @back="handleGoBack"></BaseHeader>
    <div class="px-5 py-6">
      <div class="flex items-start gap-4">
        <!-- 프로필 이미지 -->
        <div class="flex-shrink-0">
          <div
            class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100"
          >
            <img
              :src="trainerData.userProfileUrl"
              alt="프로필"
              class="h-full w-full object-cover"
            />
          </div>
        </div>

        <!-- 이름, 자격증 -->
        <div class="mt-2 min-w-0 flex-1">
          <div class="flex items-center gap-3">
            <span class="truncate text-2xl font-bold">{{
              trainerData.username
            }}</span>

            <div
              v-if="trainerData.certificates.length > 0"
              class="relative inline-block"
              @mouseenter="showTooltip = true"
              @mouseleave="showTooltip = false"
            >
              <span
                class="flex cursor-default items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-black"
              >
                <img :src="badgeIcon" alt="인증" class="h-4 w-4" />
                인증 완료
              </span>

              <!-- 툴팁 -->
              <Transition
                enter-active-class="transition-all duration-200"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-150"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-if="showTooltip"
                  class="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2"
                >
                  <div
                    class="min-w-max rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-lg"
                  >
                    <div class="text-gray-600">
                      {{ trainerData.certificates.join(", ") }}
                    </div>
                    <div
                      class="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-b-4 border-transparent border-b-white"
                    ></div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- 수강생 수 / 별점 -->
          <div class="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <span class="flex items-center gap-1.5 text-white">
              <span class="font-bold">👤</span>
              수강생 {{ trainerData.totalTraineeCount.toLocaleString() }}명
            </span>
            <span class="text-gray-300">|</span>
            <span class="flex items-center gap-1">
              <img :src="starIcon" alt="별점" class="h-4 w-4" />
              <span class="font-medium text-white">
                {{ trainerData.totalAverageRating.toFixed(1) }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 트레이너 소개 -->
    <div class="py-4">
      <TrainerCareerDisplay :career="trainerData.career" />
    </div>

    <!-- 트레이닝 목록 -->
    <div class="mt-4 px-5 py-4">
      <TrainingList
        :courses="trainingList"
        @selectTraining="goToTrainingDetail"
      />
    </div>
  </div>
</template>
