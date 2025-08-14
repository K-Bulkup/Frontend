<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getTrainingQnAListDetail } from "@/composables/api/useQnAListApi";
import { getTrainerTrainingDetail } from "@/composables/api/trainer/training/trainerTrainingDetailApi";

import BaseHeader from "@/components/common/BaseHeader.vue";
import TrainingInfo from "@/components/training/TrainingInfo.vue";
import QnAList from "@/components/training/QnAList.vue";

const router = useRouter();
const route = useRoute();
const num = (v) => (v == null ? 0 : Number(v));
const trainingId = ref(route.params.trainingId);
const trainingData = ref(null); // ✅ TrainingInfo용 데이터
const courseTitle = ref("");

const qnaData = ref([]);

const handleBack = () => router.back();

const handleCreateQuestion = () => {
  router.push({
    path: `/trainee/mypage/training/${trainingId.value}/question`,
    query: { courseTitle: courseTitle.value },
  });
};

onMounted(async () => {
  try {
    // ✅ 트레이닝 상세
    const { data: res } = await getTrainerTrainingDetail(trainingId.value);
    const detail = res.data;

    console.log("트레이닝 detail", detail);

    trainingData.value = {
      level: detail.difficulty,
      category: detail.category,
      reward: `${detail.totalReward}P`,
      title: detail.title,
      description: detail.description,
      thumbnailUrl: detail.thumbnailUrl || "",
      trainerProfileUrl: detail.trainerProfileImage,
      trainerName: detail.trainerName,
      trainingRating: detail.trainingRating,
      studentCount: num(detail.enrolledTraineeCount ?? detail.traineeCount),
      totalWeeks: 4,
    };
  } catch (e) {
    console.error("트레이닝 상세 오류:", e);
  }

  try {
    const qnaResp = await getTrainingQnAListDetail(trainingId.value);

    const body = qnaResp?.data?.data ?? {};
    const rawList = body.trainingQnADetails ?? [];
    courseTitle.value = body.trainingTitle ?? "";

    const fmt = (arr) => {
      if (!arr || arr.length < 3) return "";
      const [yyyy, mm, dd, hh = 0, mi = 0] = arr;
      return `${yyyy}.${String(mm).padStart(2, "0")}.${String(dd).padStart(
        2,
        "0",
      )} ${String(hh).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
    };

    qnaData.value = rawList.map((qna) => ({
      id: qna.qnaId,
      userName: qna.userName,
      title: qna.questionTitle || "제목 없음",
      content: qna.question,
      answer: qna.answer,
      hasAnswer: !!qna.answer,
      isExpanded: false,
      questionDate: fmt(qna.createAt),
      answerDate: fmt(qna.answeredAt),
    }));
  } catch (e) {
    console.error("❌ Q&A 리스트 조회 실패:", e);
  }
});
</script>

<template>
  <div class="flex flex-col">
    <!-- Header -->
    <BaseHeader @back="handleBack()" title="Q & A" />

    <!-- TrainingInfo: 데이터 준비되면 표시 -->
    <div v-if="trainingData">
      <TrainingInfo :training-data="trainingData" user-role="trainer" />
    </div>

    <!-- ✅ 중간 구분선 -->
    <div class="px-6">
      <div class="my-4 h-px w-full bg-gray-700/80"></div>
    </div>

    <!-- Q&A 리스트 -->
    <div class="px-6 pb-24">
      <QnAList
        :items="qnaData"
        initial-tab="completed"
        :accordion="false"
        :is-trainer="false"
      />
    </div>

    <!-- 등록 버튼 -->
    <div
      class="fixed bottom-[120px] z-50"
      style="right: max(1rem, calc(50vw - 180px))"
    >
      <button
        @click="handleCreateQuestion"
        class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 shadow-lg ring-1 ring-black/20 transition-transform hover:scale-105 active:scale-95"
        style="filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25))"
      >
        <svg class="h-8 w-8 text-primary" viewBox="0 0 30 30" fill="none">
          <path
            d="M13.75 6.25H5.97222C5.38285 6.25 4.81762 6.48413 4.40087 6.90087C3.98413 7.31762 3.75 7.88285 3.75 8.47222V24.0278C3.75 24.6171 3.98413 25.1824 4.40087 25.5991C4.81762 26.0159 5.38285 26.25 5.97222 26.25H21.5278C22.1171 26.25 22.6824 26.0159 23.0991 25.5991C23.5159 25.1824 23.75 24.6171 23.75 24.0278V16.25"
            stroke="#22E481"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M22.0828 4.46498C22.5406 4.00719 23.1615 3.75 23.8089 3.75C24.4563 3.75 25.0772 4.00719 25.535 4.46498C25.9928 4.92277 26.25 5.54367 26.25 6.19109C26.25 6.83851 25.9928 7.45941 25.535 7.91721L14.603 18.8493L10 20L11.1507 15.397L22.0828 4.46498Z"
            stroke="#22E481"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
