<script setup>
import { computed } from "vue";

const props = defineProps({ growthScore: { type: Number, required: true } });

const displayStats = computed(
  () => `3대 ${Number(props.growthScore).toLocaleString()}Kg`,
);

// 각 레벨(단계)의 최대 점수
const LEVEL_UP_THRESHOLD = 20;

// 진행 바의 퍼센티지 계산 로직 수정
const progressPercentage = computed(() => {
  if (props.growthScore === 0) {
    return 0;
  }

  // 현재 레벨에서의 진행도 (나머지 값)
  const currentProgress = props.growthScore % LEVEL_UP_THRESHOLD;

  if (currentProgress === 0) {
    return 100;
  }

  return (currentProgress / LEVEL_UP_THRESHOLD) * 100;
});

const currentLevel = computed(() => {
  // 0점일 때는 레벨 1로 시작
  if (props.growthScore === 0) {
    return 1;
  }
  const level = Math.floor((props.growthScore - 1) / LEVEL_UP_THRESHOLD) + 1;
  return level;
});
</script>

<template>
  <div class="relative rounded-r15 bg-gray-800/30 p-6 text-white shadow-lg">
    <div
      class="absolute right-4 top-4 rounded-full bg-white/20 px-4 py-1.5 text-base font-bold backdrop-blur-sm"
    >
      Lv. {{ currentLevel }}
    </div>
    <h2 class="text-4xl font-bold">{{ displayStats }}</h2>

    <p class="mt-1 text-body2 text-white">금육이의 금융 체력</p>

    <div class="mt-5">
      <div class="h-4 w-full overflow-hidden rounded-full bg-black/50">
        <div
          class="h-full rounded-full bg-gradient-to-r from-lime-100/80 to-primary/80"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>
