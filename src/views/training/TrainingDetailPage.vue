<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getTraineeTrainingPreDetail } from "@/composables/api/trainee/training/traineeTrainingPreDetailAPI";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";

const router = useRouter();
const route = useRoute();

// 상태 (API 데이터 저장)
const trainingData = ref(null);

// API 호출 및 데이터 매핑
const loadTrainingDetail = async () => {
  try {
    const res = await getTraineeTrainingPreDetail(route.params.trainingId);
    const raw = res.data.data;

    trainingData.value = {
      level: raw.level,
      category: raw.category,
      reward: `${raw.totalRoutineScore}P`, // API에서 제공되는 totalRoutineScore 사용
      trainerName: raw.trainerNickname || "트레이너명 준비중",
      trainerProfileUrl: raw.trainerProfileUrl,
      trainerRating: raw.averageRating,
      studentCount: raw.traineeCount,
      totalWeeks: 4, // API에 totalWeeks가 없으므로 기본 4주
      title: raw.title,
      description: raw.description,
      price: raw.price,
      thumbnailUrl: raw.thumbnailUrl,
    };
  } catch (err) {
    console.error("🚨 결제 전 트레이닝 상세 조회 실패:", err);
  }
};

onMounted(loadTrainingDetail);

// 가격 포맷
const formattedPrice = computed(() => {
  return trainingData.value ? trainingData.value.price.toLocaleString() : "";
});

// 뒤로가기
const goBack = () => {
  router.back();
};

// 결제 버튼 (추후 결제 API 연결)
const proceedToPayment = () => {
  console.log("결제하기 버튼 클릭 (결제 API 연결 예정)");
  // router.push('/payment');
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack pt-4">
    <main v-if="trainingData" class="flex-1 px-6">
      <BaseHeader title="트레이닝 상세" @back="goBack" />

      <!-- 난이도 / 카테고리 / 리워드 -->
      <div class="mt-4 flex items-center gap-2">
        <BaseBadge>{{ trainingData.level }}</BaseBadge>
        <BaseBadge>{{ trainingData.category }}</BaseBadge>
        <BaseBadge variant="primary" class="ml-auto">
          총 리워드 {{ trainingData.reward }}
        </BaseBadge>
      </div>

      <!-- 썸네일 -->
      <div
        class="mt-6 flex h-48 w-full items-center justify-center rounded-lg bg-gray-800"
      >
        <img
          :src="trainingData.thumbnailUrl"
          alt="트레이닝 썸네일"
          class="h-full w-full object-cover"
        />
      </div>

      <!-- 트레이너 정보 -->
      <div class="mt-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700"
          >
            <img
              :src="
                trainingData.trainerProfileUrl ||
                '@/assets/images/Image_Square.svg'
              "
              alt="프로필"
              class="h-6 w-6 rounded-full"
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

      <!-- 제목 + 설명 -->
      <h2 class="mt-5 text-heading font-bold text-white">
        {{ trainingData.title }}
      </h2>
      <p class="mt-2 text-body text-gray-300">{{ trainingData.description }}</p>

      <div class="mb-4 mt-8 h-px bg-gray-700"></div>

      <!-- 가격 -->
      <div class="text-title font-bold text-white">{{ formattedPrice }}원</div>

      <!-- 결제 버튼 -->
      <div class="mt-12 pb-8">
        <button
          @click="proceedToPayment"
          class="h-14 w-full rounded-xl bg-white text-lg font-bold text-black"
        >
          결제하기
        </button>
      </div>
    </main>
  </div>
</template>
