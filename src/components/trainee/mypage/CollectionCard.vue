<script setup>
import { computed, ref, watch } from "vue";

import Geumyuk1 from "@/assets/images/mascot/level/Geumyuk_1.png";
import Geumyuk2 from "@/assets/images/mascot/level/Geumyuk_2.png";
import Geumyuk3 from "@/assets/images/mascot/level/Geumyuk_3.png";
import Geumyuk4 from "@/assets/images/mascot/level/Geumyuk_4.png";
import Geumyuk5 from "@/assets/images/mascot/level/Geumyuk_5.png";
import Geumyuk6 from "@/assets/images/mascot/level/Geumyuk_6.png";
import Geumyuk7 from "@/assets/images/mascot/level/Geumyuk_7.png";
import Geumyuk8 from "@/assets/images/mascot/level/Geumyuk_8.png";
import Geumyuk9 from "@/assets/images/mascot/level/Geumyuk_9.png";
import Geumyuk10 from "@/assets/images/mascot/level/Geumyuk_10.png";
import Geumyuk11 from "@/assets/images/mascot/level/Geumyuk_11.png";
import Geumyuk12 from "@/assets/images/mascot/level/Geumyuk_12.png";
import Geumyuk13 from "@/assets/images/mascot/level/Geumyuk_13.png";
import Geumyuk14 from "@/assets/images/mascot/level/Geumyuk_14.png";
import Geumyuk15 from "@/assets/images/mascot/level/Geumyuk_15.png";
import Geumyuk16 from "@/assets/images/mascot/level/Geumyuk_16.png";
import Geumyuk17 from "@/assets/images/mascot/level/Geumyuk_17.png";
import Geumyuk18 from "@/assets/images/mascot/level/Geumyuk_18.png";
import Geumyuk19 from "@/assets/images/mascot/level/Geumyuk_19.png";
import Geumyuk20 from "@/assets/images/mascot/level/Geumyuk_20.png";
import Geumyuk21 from "@/assets/images/mascot/level/Geumyuk_21.png";
import Geumyuk22 from "@/assets/images/mascot/level/Geumyuk_22.png";
import Geumyuk23 from "@/assets/images/mascot/level/Geumyuk_23.png";
import Geumyuk24 from "@/assets/images/mascot/level/Geumyuk_24.png";
import Geumyuk25 from "@/assets/images/mascot/level/Geumyuk_25.png";

const characterImages = [
  Geumyuk1,
  Geumyuk2,
  Geumyuk3,
  Geumyuk4,
  Geumyuk5,
  Geumyuk6,
  Geumyuk7,
  Geumyuk8,
  Geumyuk9,
  Geumyuk10,
  Geumyuk11,
  Geumyuk12,
  Geumyuk13,
  Geumyuk14,
  Geumyuk15,
  Geumyuk16,
  Geumyuk17,
  Geumyuk18,
  Geumyuk19,
  Geumyuk20,
  Geumyuk21,
  Geumyuk22,
  Geumyuk23,
  Geumyuk24,
  Geumyuk25,
];

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

    list.push({
      id: i,
      image: isUnlocked ? characterImages[i] : "",
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
