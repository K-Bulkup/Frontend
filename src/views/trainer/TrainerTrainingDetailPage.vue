<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseTabNavigation from "@/components/common/BaseTabNavigation.vue";

import TrainingInfo from "@/components/training/TrainingInfo.vue";
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
const activeTab = ref("details"); //Navi
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

// 탭 변경 핸들러
const handleTabChange = (tabId) => {
  activeTab.value = tabId;
};

// 탭 목록 정의
const tabs = [
  { id: "details", label: "상세 설명" },
  { id: "reviews", label: "리뷰" },
  { id: "qna", label: "QnA" },
];

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
      rating: detail.trainingRating,
      studentCount: num(detail.enrolledTraineeCount),
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
  <div>
    <BaseHeader @back="goBack" title="트레이닝 상세"></BaseHeader>
    <div>
      <TrainingInfo
        v-if="trainingData"
        :training-data="trainingData"
        user-role="trainer"
      />
    </div>

    <!-- BaseTabNavigation 사용 -->
    <div class="mx-3 my-3">
      <BaseTabNavigation
        :tabs="tabs"
        :default-tab="'details'"
        container-class=""
        @tab-change="handleTabChange"
      >
        <!-- 상세 설명 탭 컨텐츠 -->
        <template #details>
          <div>
            <!-- 트레이닝 설명 -->
            <div v-if="trainingData?.description" class="mx-2 mb-6">
              <div class="border-l-4p-4 mb-4 rounded-lg">
                <p class="text-body leading-relaxed text-gray-300">
                  {{ trainingData.description }}
                </p>
              </div>
            </div>

            <!-- 루틴 목록 -->
            <div>
              <div class="mb-2 ml-2 text-body font-bold">루틴 목록</div>
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

        <!-- 리뷰 탭 컨텐츠 -->
        <template #reviews>
          <div class="space-y-4">
            <div class="py-8 text-center text-gray-500">리뷰가 없습니다.</div>
          </div>
        </template>

        <!-- QnA 탭 컨텐츠 -->
        <template #qna>
          <div class="py-8 text-center text-gray-500">
            <p>QnA가 없습니다.</p>
          </div>
        </template>
      </BaseTabNavigation>
    </div>
  </div>
</template>
