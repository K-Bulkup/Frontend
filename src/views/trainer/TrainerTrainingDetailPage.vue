<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import profileDefault from "@/assets/images/mascot/profile.png";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import ReviewList from "@/components/common/ReviewList.vue";
import TrainerRoutineSection from "@/components/trainer/training/TrainerRoutineSection.vue";

import { getReviews } from "@/composables/api/useReviewApi";
import {
  getTrainerTrainingDetail,
  getTrainerTrainingRoutines,
} from "@/composables/api/trainer/training/trainerTrainingDetailApi";

const route = useRoute();
const router = useRouter();

const trainingData = ref(null);
const reviewList = ref([]);
const num = (v) => (v == null ? 0 : Number(v));

const expandedSections = ref({
  stretching: true,
  strength: false,
  cardio: false,
});

const categorizedRoutines = ref({
  stretching: [],
  strength: [],
  cardio: [],
});

const sectionTitles = {
  stretching: "스트레칭",
  strength: "근력",
  cardio: "유산소",
};

const goBack = () => {
  router.back();
};

const toggleSection = (category) => {
  expandedSections.value[category] = !expandedSections.value[category];
};

onMounted(async () => {
  const trainingId = route.params.trainingId;

  try {
    // ✅ 트레이닝 상세
    const { data: res } = await getTrainerTrainingDetail(trainingId);
    const detail = res.data;

    trainingData.value = {
      level: detail.difficulty,
      category: detail.category,
      reward: `${detail.totalReward}P`,
      title: detail.title,
      description: detail.description,
      thumbnailUrl: detail.thumbnailUrl || "",
      trainerProfileUrl: detail.trainerProfileImage,
      trainerName: detail.trainerName,
      trainerRating: detail.trainerRating,
      studentCount: num(detail.enrolledTraineeCount ?? detail.traineeCount),
      totalWeeks: 4,
    };

    // ✅ 루틴 목록 조회 및 분류
    const { data: routineRes } = await getTrainerTrainingRoutines(trainingId);
    const routines = routineRes.data;

    categorizedRoutines.value = {
      stretching: [],
      strength: [],
      cardio: [],
    };

    routines.forEach(({ category, routineTitle }) => {
      const routine = { title: routineTitle, routineType: category };

      if (category === "스트레칭") {
        categorizedRoutines.value.stretching.push(routine);
      } else if (category === "근력") {
        categorizedRoutines.value.strength.push(routine);
      } else if (category === "유산소") {
        categorizedRoutines.value.cardio.push(routine);
      }
    });
  } catch (e) {
    console.error("트레이닝 상세 또는 루틴 API 오류:", e);
  }

  try {
    const response = await getReviews(trainingId);

    if (response.success) {
      reviewList.value = response.data.map((review, index) => ({
        id: index,
        author: review.username,
        rating: review.rating,
        content: review.content,
      }));
    } else {
      console.error("리뷰 실패:", response.message);
    }
  } catch (error) {
    console.error("리뷰 API 호출 중 오류:", error);
    reviewList.value = [];
  }
});
</script>

<template>
  <div
    v-if="trainingData"
    class="min-h-screen overflow-y-auto bg-realBlack px-6 pb-20 pt-4 text-white"
  >
    <BaseHeader title="트레이닝 상세" @back="goBack" />

    <div class="mt-4 flex items-center gap-2">
      <BaseBadge>{{ trainingData.level }}</BaseBadge>
      <BaseBadge>{{ trainingData.category }}</BaseBadge>
      <BaseBadge variant="primary" class="ml-auto">
        총 리워드 {{ trainingData.reward }}
      </BaseBadge>
    </div>

    <div
      class="mt-6 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-800"
    >
      <img
        :src="trainingData.thumbnailUrl"
        alt="트레이닝 썸네일"
        class="h-full w-full object-cover"
      />
    </div>

    <div class="mt-6 flex items-center justify-between">
      <div class="flex items-center gap-3 rounded-lg p-2">
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
        <span>{{ trainingData.totalWeeks }}주</span>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-heading font-bold">{{ trainingData.title }}</h2>
      <p class="mt-2 text-body text-gray-300">
        {{ trainingData.description }}
      </p>
    </div>

    <div class="my-6 h-px bg-gray-800"></div>

    <ReviewList :reviews="reviewList" />

    <div class="my-6 h-px bg-gray-800"></div>

    <div>
      <h3 class="mb-4 text-xl font-bold">루틴 목록</h3>
      <TrainerRoutineSection
        v-for="(routines, category) in categorizedRoutines"
        :key="category"
        :title="sectionTitles[category]"
        :routines="routines"
        :is-expanded="expandedSections[category]"
        :show-add-button="false"
        @toggle="toggleSection(category)"
      />
    </div>
  </div>
</template>
