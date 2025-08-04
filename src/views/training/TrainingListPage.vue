<template>
  <div class="flex min-h-screen flex-col items-center bg-realBlack text-black">
    <!-- ✅ Compact Floating SearchBar -->
    <div
      class="fixed left-0 right-0 top-6 z-50 flex justify-center bg-realBlack py-3 shadow-md"
    >
      <div
        class="flex h-9 w-[85%] max-w-[360px] items-center rounded-full border border-gray-800 bg-gray-800 px-3 shadow-sm"
      >
        <svg
          class="mr-1 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="  강의명 / 강사명 입력"
          class="flex-1 bg-transparent text-body text-black placeholder-gray-400 focus:outline-none"
        />
      </div>
    </div>

    <!-- ✅ 2열 카드 그리드 -->
    <div
      class="grid w-full max-w-[460px] grid-cols-2 gap-3 overflow-y-auto px-3 pb-24 pt-20"
    >
      <div
        v-for="(training, index) in filteredTrainings"
        :key="index"
        class="flex flex-col rounded-md border border-gray-200 bg-gray-100 p-3 shadow-md transition-all hover:shadow-[0_4px_12px_rgba(251,224,129,0.25)]"
      >
        <!-- 썸네일 -->
        <div
          class="flex h-24 w-full items-center justify-center rounded-md bg-gray-200"
        >
          <span class="text-caption text-gray-500">이미지</span>
        </div>

        <!-- 강의 정보 -->
        <div class="mt-2 flex flex-col space-y-1">
          <h3 class="truncate text-heading font-semibold text-black">
            {{ training.title }}
          </h3>
          <p class="text-subtext text-gray-600">{{ training.trainer }}</p>

          <div class="flex items-center space-x-1 text-caption text-yellow-500">
            ⭐ <span>{{ training.rating }}</span>
          </div>
          <p class="text-body font-bold text-black">
            {{ training.price.toLocaleString() }}원
          </p>

          <!-- 뱃지 -->
          <div class="mt-1 flex space-x-1">
            <span
              class="rounded-md bg-gray-200 px-2 py-0.5 text-extra text-gray-700"
            >
              재무설계
            </span>
            <span
              class="rounded-md bg-primary px-2 py-0.5 text-extra text-black"
            >
              중급
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ 우측 하단 Floating Action Button -->
    <button
      class="fixed bottom-20 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-primary shadow-lg"
    >
      <svg
        class="h-5 w-5 text-black"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const searchQuery = ref("");
const trainings = ref([
  { title: "예금관리의 기초", trainer: "김팀스", price: 21000, rating: 4.8 },
  { title: "투자 입문 강좌", trainer: "박강사", price: 35000, rating: 4.7 },
  { title: "주식 고급 과정", trainer: "이전문가", price: 50000, rating: 4.9 },
  { title: "재무설계 실전편", trainer: "최재무", price: 42000, rating: 4.6 },
]);

const filteredTrainings = computed(() => {
  if (!searchQuery.value) return trainings.value;
  return trainings.value.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.trainer.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});
</script>
