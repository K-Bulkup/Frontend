<script setup>
import { defineEmits } from "vue";

defineProps({
  title: {
    type: String,
    default: "실패하였습니다",
  },
  subtitle: {
    type: String,
    default: "",
  },
  retryButtonText: {
    type: String,
    default: "다시 시도",
  },
});

const emit = defineEmits(["retry"]);

const handleRetry = () => {
  emit("retry");
};
</script>

<template>
  <!-- Modal Overlay -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-realBlack">
    <!-- Modal Content -->
    <div
      class="mx-8 flex w-full max-w-sm flex-col items-center bg-realBlack px-8 py-12"
    >
      <!-- Warning Triangle Icon -->
      <div class="w-18 h-18 mb-6 flex items-center justify-center">
        <svg
          width="70"
          height="70"
          viewBox="0 0 70 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M62.7854 53.9583L37.5263 10.2083C36.4037 8.26389 33.5971 8.26389 32.4745 10.2083L7.21542 53.9583C6.0928 55.9028 7.49608 58.3333 9.74133 58.3333H60.2595C62.5047 58.3333 63.908 55.9028 62.7854 53.9583Z"
            fill="#F9F9F9"
            stroke="#F9F9F9"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M39.375 46.6665C39.375 49.0827 37.4162 51.0415 35 51.0415C32.5838 51.0415 30.625 49.0827 30.625 46.6665C30.625 44.2503 32.5838 42.2915 35 42.2915C37.4162 42.2915 39.375 44.2503 39.375 46.6665Z"
            fill="#383838"
          />
          <path
            d="M35 35L35 26.25"
            stroke="#383838"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- Title -->
      <h2 class="mb-4 text-center text-title font-bold text-gray-50">
        {{ title }}
      </h2>

      <!-- Subtitle (optional) -->
      <p v-if="subtitle" class="mb-16 text-center text-body text-gray-400">
        {{ subtitle }}
      </p>

      <!-- Spacing when no subtitle -->
      <div v-else class="mb-12"></div>

      <!-- Retry Button -->
      <button
        @click="handleRetry"
        class="h-12 w-full rounded-xl border border-gray-100 bg-black text-heading font-semibold text-white transition-opacity hover:opacity-80"
      >
        {{ retryButtonText }}
      </button>
    </div>
  </div>
</template>
