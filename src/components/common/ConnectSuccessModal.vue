<script setup>
import { defineEmits } from "vue";

defineProps({
  title: {
    type: String,
    default: "성공하였습니다",
  },
  subtitle: {
    type: String,
    default: "",
  },
  confirmButtonText: {
    type: String,
    default: "확인",
  },
});

const emit = defineEmits(["close"]);

const handleConfirm = () => {
  emit("close");
};
</script>

<template>
  <!-- Modal Overlay -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-realBlack">
    <!-- Modal Content -->
    <div
      class="mx-8 flex w-full max-w-sm flex-col items-center bg-realBlack px-8 py-12"
    >
      <!-- Check Mark Icon -->
      <div class="w-15 h-15 mb-6 flex items-center justify-center">
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="30" cy="30" r="30" fill="white" />
          <path
            d="M20 31L27 38L42 23"
            stroke="black"
            stroke-width="4"
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

      <!-- Confirm Button -->
      <button
        @click="handleConfirm"
        class="h-12 w-full rounded-xl border border-gray-100 bg-black text-heading font-semibold text-white transition-opacity hover:opacity-80"
      >
        {{ confirmButtonText }}
      </button>
    </div>
  </div>
</template>
