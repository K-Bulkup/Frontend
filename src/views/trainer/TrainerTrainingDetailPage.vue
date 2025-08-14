<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseTabNavigation from "@/components/common/BaseTabNavigation.vue";

import TrainingInfo from "@/components/training/TrainingInfo.vue";
import TrainerRoutineSection from "@/components/trainer/training/TrainerRoutineSection.vue";
import ReviewList from "@/components/common/ReviewList.vue";
import QnAList from "@/components/training/QnAList.vue";

import { getReviews } from "@/composables/api/useReviewApi";
import {
  getTrainerTrainingDetail,
  getTrainerTrainingRoutines,
} from "@/composables/api/trainer/training/trainerTrainingDetailApi";
import { getTrainingQnAListDetail } from "@/composables/api/useQnAListApi";

const route = useRoute();
const router = useRouter();

const trainingId = route.params.trainingId;
const trainingData = ref(null);
const reviewList = ref([]);
const activeTab = ref("details");

const averageRating = ref(0);
const totalReviews = ref(0);

const qnaItems = ref([]);

const num = (v) => (v == null ? 0 : Number(v));
const formatDate = (arr) => {
  if (!arr || arr.length < 3) return "";
  const [yyyy, mm, dd, hh = 0, mi = 0] = arr;
  return `${yyyy}.${String(mm).padStart(2, "0")}.${String(dd).padStart(2, "0")} ${String(hh).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
};

const expandedSections = ref({
  stretching: true,
  strength: false,
  cardio: false,
});
const categorizedRoutines = ref({ stretching: [], strength: [], cardio: [] });
const sectionTitles = {
  stretching: "스트레칭",
  strength: "근력",
  cardio: "유산소",
};

const goBack = () => router.back();
const toggleSection = (category) => {
  expandedSections.value[category] = !expandedSections.value[category];
};

// 탭 변경 핸들러
const handleTabChange = (tabId) => {
  activeTab.value = tabId;
};

const tabs = [
  { id: "details", label: "상세 설명" },
  { id: "reviews", label: "리뷰" },
  { id: "qna", label: "QnA" },
];

// ✅ QnA 불러오기 함수
const loadQnA = async () => {
  try {
    const { data } = await getTrainingQnAListDetail(trainingId);
    const body = data?.data ?? {};
    const raw = body.trainingQnADetails ?? [];
    qnaItems.value = raw.map((q) => ({
      id: q.qnaId,
      userName: q.userName,
      title: q.questionTitle || "제목 없음",
      content: q.question,
      answer: q.answer,
      hasAnswer: !!q.answer,
      isExpanded: false,
      questionDate: formatDate(q.createAt), // ✅ formatDate 사용
      answerDate: formatDate(q.answeredAt),
    }));
  } catch (e) {
    console.error("❌ Q&A 리스트 조회 실패:", e);
  }
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

    if (response.success && response.data) {
      averageRating.value = response.data.averageRating || 0;
      totalReviews.value = response.data.totalReviewCount || 0;

      reviewList.value = (response.data.reviews || []).map((review, index) => ({
        id: review.id || index,
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
    averageRating.value = 0;
    totalReviews.value = 0;
  }

  await loadQnA();
});
</script>
<template>
  <div class="flex min-h-[100dvh] flex-col">
    <BaseHeader @back="goBack" title="트레이닝 상세"></BaseHeader>
    <div class="flex-1 overflow-y-auto">
      <div class="mx-3 mb-3 pb-[calc(env(safe-area-inset-bottom)+96px)]">
        <TrainingInfo
          v-if="trainingData"
          :training-data="trainingData"
          user-role="trainer"
        />

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
              <ReviewList
                :average-rating="averageRating"
                :total-reviews="totalReviews"
                :reviews="reviewList"
              />
            </template>

            <!-- QnA 탭 컨텐츠 -->
            <template #qna>
              <QnAList
                :items="qnaItems"
                :is-trainer="true"
                :training-id="trainingId"
                initial-tab="pending"
                :accordion="false"
                @answered="loadQnA"
              />
            </template>
          </BaseTabNavigation>
        </div>
      </div>
    </div>
  </div>
</template>
