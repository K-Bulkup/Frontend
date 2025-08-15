<script setup>
import { computed } from "vue";

const props = defineProps({
  userName: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div
    class="flex justify-center rounded-r15 bg-realBlack/30 p-6 text-white shadow-lg"
  >
    <div class="flex flex-wrap items-baseline gap-x-4">
      <h2 class="text-2xl font-bold">{{ userName }}님</h2>
      <p class="text-input text-white/80">오늘도 금육이를 키워봐요!</p>
    </div>
  </div>
</template>
