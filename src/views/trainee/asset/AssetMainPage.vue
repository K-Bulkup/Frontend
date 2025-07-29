<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToAccountConnect = () => {
  router.push("/trainee/asset/account");
};

const goToAiChat = () => {
  router.push("/trainee/asset/ai-chat");
};
</script>

<template>
  <div class="min-h-screen bg-realBlack pb-20">
    <!-- Header -->
    <div class="flex justify-center py-4">
      <h1 class="text-body font-semibold text-white">자산 관리</h1>
    </div>

    <!-- Main Content -->
    <div class="space-y-6 px-6">
      <!-- Total Assets Section -->
      <div class="rounded-xl bg-gray-100 p-6 shadow-lg">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="mb-2 text-heading font-semibold text-black">총 자산</h2>
            <p class="text-title font-bold text-black">3,800만원</p>
          </div>
          <button
            @click="goToAccountConnect"
            class="rounded-lg bg-primary px-4 py-2 text-subtext font-normal text-realBlack"
          >
            자산 불러오기
          </button>
        </div>
      </div>

      <!-- Asset Trend Section -->
      <div class="rounded-xl bg-gray-100 p-6 shadow-lg">
        <h3 class="mb-4 text-heading font-semibold text-black">자산 추이</h3>
        <div class="flex h-32 items-center justify-center text-gray-700">
          <span class="text-subtext">선 그래프</span>
        </div>
      </div>

      <!-- Bottom Grid Sections -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Asset Composition -->
        <div class="rounded-xl bg-gray-100 p-4 shadow-lg">
          <h3 class="mb-4 text-heading font-semibold text-black">자산 구성</h3>
          <div class="flex h-32 items-center justify-center text-gray-700">
            <span class="text-subtext">도넛 차트</span>
          </div>
        </div>

        <!-- Income/Expense Status -->
        <div class="rounded-xl bg-gray-100 p-4 shadow-lg">
          <h3 class="mb-4 text-heading font-semibold text-black">
            수입/지출 현황
          </h3>
          <div class="flex h-32 items-center justify-center text-gray-700">
            <span class="text-subtext">막대 그래프</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating AI Chat Button -->
    <button
      @click="goToAiChat"
      class="w-15 h-15 fixed bottom-24 right-6 flex items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <div class="relative">
        <svg
          width="30"
          height="24"
          viewBox="0 0 32 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-black stroke-2"
        >
          <path
            d="M31 13C31 19.6274 24.2843 25 16 25C13.0482 25 10.2956 24.3179 7.97495 23.14L1 25L3.32498 19.42C1.85261 17.5635 1 15.3614 1 13C1 6.37258 7.71573 1 16 1C24.2843 1 31 6.37258 31 13Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-body font-semibold text-black"
        >
          AI
        </span>
      </div>
    </button>
  </div>
</template>
