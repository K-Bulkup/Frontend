<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import profileDefault from "@/assets/images/mascot/profile.png";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import ReviewList from "@/components/common/ReviewList.vue";
import TrainerRoutineSection from "@/components/trainer/training/TrainerRoutineSection.vue";

import { getReviews } from "@/composables/api/useReviewApi";

const route = useRoute();
const router = useRouter();

const trainingData = ref(null);
const reviewList = ref([]);

// 각 섹션의 펼침 상태를 독립적으로 관리하기 위한 객체
const expandedSections = ref({
  stretching: true, // 기본으로 스트레칭 섹션은 펼쳐진 상태로 시작
  strength: false,
  cardio: false,
});

// routineType에 따라 분류된 루틴 목록
const categorizedRoutines = ref({
  stretching: [],
  strength: [],
  cardio: [],
});

// 각 섹션의 제목을 매핑
const sectionTitles = {
  stretching: "스트레칭",
  strength: "근력",
  cardio: "유산소",
};

const goBack = () => {
  router.back();
};

// 섹션 펼침/닫힘 상태를 토글하는 함수
const toggleSection = (category) => {
  expandedSections.value[category] = !expandedSections.value[category];
};

onMounted(async () => {
  const trainingId = route.params.trainingId;

  // --- 예시용 데이터 ---
  // 실제로는 API를 통해 trainingId로 상세 정보를 가져옵니다.
  trainingData.value = {
    level: "중급",
    category: "재테크",
    reward: "30P",
    title: "MZ세대를 위한 금융 루틴",
    description: "습관을 통해 자산을 성장시키는 트레이닝입니다.",
    thumbnailUrl: "https://via.placeholder.com/300x150",
    trainerProfileUrl: null,
    trainerName: "김코치",
    trainerRating: 4.8,
    studentCount: 120,
    totalWeeks: 8,
  };

  try {
    const response = await getReviews(trainingId);

    console.log("API로부터 받은 리뷰 데이터:", response);

    if (response.success) {
      reviewList.value = response.data.map((review, index) => ({
        id: index,
        author: review.username,
        rating: review.rating,
        content: review.content,
      }));
    } else {
      console.error("리뷰 데이터를 불러오는데 실패했습니다:", response.message);
    }
  } catch (error) {
    console.error("리뷰 API 호출 중 에러 발생:", error);
    reviewList.value = [];
  }

  // API에서 받아온 전체 루틴 목록 (가정)
  const allRoutinesFromApi = [
    { id: 1, title: "오전 5분 명상", routineType: "stretching" },
    { id: 2, title: "경제 뉴스 1개 읽기", routineType: "stretching" },
    { id: 3, title: "주 1회 가계부 정리", routineType: "strength" },
    { id: 4, title: "월급날 선저축 후지출", routineType: "strength" },
  ];

  // 받아온 루틴 목록을 routineType에 따라 분류
  allRoutinesFromApi.forEach((routine) => {
    if (categorizedRoutines.value[routine.routineType]) {
      categorizedRoutines.value[routine.routineType].push(routine);
    }
  });
  // --- 예시 데이터 끝 ---
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
