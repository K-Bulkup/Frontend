<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// 실제 프로젝트에 맞게 컴포넌트 경로를 확인하세요.
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";

const router = useRouter();

// --- 상태 (State) ---
// 실제 앱에서는 이 데이터를 API 호출을 통해 받아와야 합니다.
const trainingData = ref({
  trainerId: 1, // 트레이너 페이지로 이동하기 위한 ID
  trainerProfileUrl: null, // 트레이너 프로필 이미지 URL (null이면 기본 아이콘 표시)
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
    "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?q=80&w=2070&auto=format&fit=crop", // 예시 썸네일
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

// 트레이너 상세 페이지로 이동
const goToTrainerPage = () => {
  if (trainingData.value.trainerId) {
    router.push(`/trainee/trainer/${trainingData.value.trainerId}`);
  } else {
    console.error("이동할 트레이너의 ID가 없습니다.");
  }
};

// 결제 페이지로 이동 (가상)
const proceedToPayment = () => {
  console.log("결제하기 버튼 클릭");
  // 예시: router.push({ name: 'Payment', params: { trainingId: trainingData.value.id } });
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack pt-4">
    <main class="flex-1 px-6">
      <BaseHeader title="트레이닝 상세" @back="goBack" />

      <div class="mt-4 flex items-center gap-2">
        <BaseBadge v-for="tag in trainingData.tags" :key="tag">{{
          tag
        }}</BaseBadge>
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
        <div
          @click="goToTrainerPage"
          class="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-800"
        >
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
              src="@/assets/images/Image_Square.svg"
              alt="기본 프로필"
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

      <div class="mb-4 mt-8 h-px bg-gray-700"></div>

      <div class="text-title font-bold text-white">{{ formattedPrice }}원</div>

      <div class="mt-12 pb-8">
        <button
          @click="proceedToPayment"
          class="h-14 w-full rounded-xl bg-white text-lg font-bold text-black active:bg-gray-200"
        >
          결제하기
        </button>
      </div>
    </main>
  </div>
</template>
