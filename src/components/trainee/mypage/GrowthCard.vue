<script setup>
import { computed } from "vue";

const props = defineProps({
  growthScore: { type: Number, required: true },
});

const displayStats = computed(
  () => `3대 ${Number(props.growthScore).toLocaleString()}Kg`,
);

// 진행 바의 퍼센티지
const MAX_SCORE = 500;
const progressPercentage = computed(() => {
  const percentage = (props.growthScore / MAX_SCORE) * 100;
  return Math.min(percentage, 100);
});
</script>

<template>
  <div class="rounded-r15 bg-realBlack/30 p-6 text-white shadow-lg">
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
