<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  growthScore: { type: Number, required: true },
  userName: { type: String, required: true },
});

const TOTAL_CHARACTERS = 25;
const CHARACTERS_PER_PAGE = 5;
const POINTS_PER_CHARACTER = 20;
const TOTAL_PAGES = 5;

// 점수
const score = computed(() => Number(props.growthScore) || 0);

// 해금된 캐릭터 수
const unlockedCount = computed(() => {
  let cnt = Math.floor(score.value / POINTS_PER_CHARACTER) + 1; // 최소 1개 해금
  if (score.value >= 480) cnt = TOTAL_CHARACTERS; // 480 이상이면 모두 해금
  return Math.min(cnt, TOTAL_CHARACTERS);
});

// 현재 페이지 상태 (점수 기반)
const currentPage = ref(
  Math.min(Math.floor(score.value / 100) + 1, TOTAL_PAGES),
);

// score가 바뀌면 페이지 자동 조정
watch(score, () => {
  currentPage.value = Math.min(Math.floor(score.value / 100) + 1, TOTAL_PAGES);
});

// 이전 페이지로 이동
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// 다음 페이지로 이동
const nextPage = () => {
  if (currentPage.value < TOTAL_PAGES) {
    currentPage.value++;
  }
};

// 현재 페이지 캐릭터 목록
const displayedCharacters = computed(() => {
  const startIndex = (currentPage.value - 1) * CHARACTERS_PER_PAGE;
  const endIndex = Math.min(startIndex + CHARACTERS_PER_PAGE, TOTAL_CHARACTERS);

  const list = [];
  for (let i = startIndex; i < endIndex; i++) {
    const isUnlocked = i < unlockedCount.value;

    const imagePath = isUnlocked
      ? `../../../assets/images/mascot/level/Geumyuk_${i + 1}.png`
      : `../../../assets/images/lock_white.svg`;

    list.push({
      id: i,
      image: new URL(imagePath, import.meta.url).href,
      unlocked: isUnlocked,
    });
  }
  return list;
});
</script>

<template>
  <div class="relative rounded-r15 bg-gray-800/30 p-4 text-white shadow-lg">
    <div class="absolute right-2 top-2 mr-2 flex items-center gap-2">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="p-2 transition-opacity duration-300"
        :class="{ 'cursor-not-allowed opacity-30': currentPage === 1 }"
      >
        ‹
      </button>
      <button
        @click="nextPage"
        :disabled="currentPage === TOTAL_PAGES"
        class="p-2 transition-opacity duration-300"
        :class="{
          'cursor-not-allowed opacity-30': currentPage === TOTAL_PAGES,
        }"
      >
        ›
      </button>
    </div>

    <p class="mb-3 ml-2 flex items-center text-subTitle2 font-bold">
      {{ userName }}님이 모은 금육이
    </p>

    <div class="flex justify-between gap-2">
      <div
        v-for="char in displayedCharacters"
        :key="char.id"
        class="flex flex-col items-center"
      >
        <div class="relative h-12 w-12">
          <img
            v-if="char.unlocked"
            :src="char.image"
            :alt="`캐릭터 ${char.id + 1}`"
            class="h-12 w-12 rounded-full object-contain"
          />
          <img
            v-else
            src="../../../assets/images/question_mark.png"
            alt="lock"
            class="h-12 w-12 object-contain p-2"
          />
        </div>
        <span class="mt-1 text-sm">
          {{ char.id + 1 }}
        </span>
      </div>
    </div>
  </div>
</template>
