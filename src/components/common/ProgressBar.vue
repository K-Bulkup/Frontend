<script setup>
const props = defineProps({
  value: { type: Number, default: 0 },
});
</script>

<template>
  <div class="w-full rounded-xl bg-gray-900 p-4">
    <!-- p-4 → p-3: 살짝 슬림 -->
    <div class="mb-2 flex items-center justify-between">
      <span class="text-input font-bold text-gray-300">진행률</span>
      <span class="text-input font-bold text-primary">{{ props.value }}%</span>
      <!-- 숫자: primary -->
    </div>
    <div class="h-2 w-full overflow-hidden rounded-full bg-gray-800">
      <!-- h-3 → h-4: 더 두껍게 -->
      <div
        class="h-full rounded-full bg-primary"
        :style="{ width: Math.min(100, Math.max(0, props.value)) + '%' }"
      />
    </div>
  </div>
</template>
