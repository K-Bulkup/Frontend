<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";

const router = useRouter();

// --- 상태 (State) ---

// 이미지에 표시된 트레이닝 상세 정보 데이터
const trainingData = ref({
  tags: ["초급", "투자입문"],
  reward: "20P",
  trainerName: "김헬스",
  trainerRating: 4.8,
  studentCount: 15,
  totalWeeks: 4,
  title: "초보자를 위한 주식 투자 완전 정복",
  description:
    "상세설명상세설명상세설명상세설명상세설명상세설명상세설명상세설명상세설명상세설명상세설명상세설명상세설명상세설명상세설명상세설명",
  price: 21000,
  thumbnailUrl:
    "https://your-s3-bucket.s3.amazonaws.com/path/to/your/image.jpg",
});

// --- 계산된 속성 (Computed) ---

// 가격을 콤마가 포함된 문자열로 변환합니다.
const formattedPrice = computed(() => {
  return trainingData.value.price.toLocaleString();
});

// --- 메서드 (Methods) ---

// 뒤로가기
const goBack = () => {
  router.back();
};

// 결제 페이지로 이동 (가상)
const proceedToPayment = () => {
  console.log("결제하기 버튼 클릭");
  // router.push('/payment');
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack px-6 pt-4">
    <BaseHeader title="트레이닝 상세" @back="goBack" />

    <main class="flex-1 pb-10">
      <div class="mt-4 flex items-center gap-2">
        <BaseBadge>{{ trainingData.tags[0] }}</BaseBadge>
        <BaseBadge>{{ trainingData.tags[1] }}</BaseBadge>
        <BaseBadge variant="primary" class="ml-auto">
          총 리워드 {{ trainingData.reward }}
        </BaseBadge>
      </div>

      <div
        class="mt-6 flex h-48 w-full items-center justify-center rounded-lg bg-gray-800"
      >
        <img
          :src="trainingData.thumbnailUrl"
          alt="트레이닝 썸네일"
          class="h-full w-full object-cover"
        />
      </div>

      <div class="mt-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700"
          >
            <img
              src="@/assets/images/Image_Square.svg"
              alt="프로필"
              class="h-6 w-6"
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

      <h2 class="mt-5 text-heading font-bold text-white">
        {{ trainingData.title }}
      </h2>
      <p class="mt-2 text-body text-gray-300">
        {{ trainingData.description }}
      </p>

      <div class="my-8 mb-4 h-px bg-gray-700"></div>

      <div class="mt-8 text-title font-bold text-white">
        {{ formattedPrice }}원
      </div>
    </main>

    <div class="mt-auto pb-8">
      <button
        @click="proceedToPayment"
        class="h-14 w-full rounded-xl bg-white text-lg font-bold text-black"
      >
        결제하기
      </button>
    </div>
  </div>
</template>
