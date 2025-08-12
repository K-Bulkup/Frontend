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
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-background"
  >
    <div
      class="mx-8 flex w-full max-w-sm flex-col items-center bg-background px-8 py-12"
    >
      <div class="w-15 h-15 mb-6 flex items-center justify-center">
        <img
          src="@/assets/images/success.svg"
          alt="success"
          class="h-32 w-32 opacity-80"
        />
      </div>

      <!-- Title -->
      <h2 class="mb-4 text-center text-[24px] font-bold text-gray-300">
        {{ title }}
      </h2>

      <!-- Subtitle (optional) -->
      <p v-if="subtitle" class="mb-16 text-center text-body text-gray-300">
        {{ subtitle }}
      </p>

      <!-- subtitle이 없을 때 -->
      <div v-else class="mb-12"></div>

      <!-- Confirm Button -->
      <button
        @click="handleConfirm"
        class="text-heading h-12 w-full rounded-xl bg-primary font-semibold text-gray-900 transition-opacity hover:opacity-80"
      >
        {{ confirmButtonText }}
      </button>
    </div>
  </div>
</template>
