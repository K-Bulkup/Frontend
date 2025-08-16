<script setup>
import failureImage from "@/assets/images/fail.svg";
import BaseButton from "./BaseButton.vue";
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
  confirmButtonText: {
    type: String,
    default: "확인",
  },
  imageSrc: {
    type: String,
    default: failureImage,
  },
  imageAlt: {
    type: String,
    default: "failure",
  },
});

const emit = defineEmits(["close"]);

const handleConfirm = () => {
  emit("close");
};
</script>

<template>
  <!-- Modal Overlay -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-background"
  >
    <!-- Modal Content -->
    <div
      class="mx-8 flex w-full max-w-sm flex-col items-center bg-background px-8 py-12"
    >
      <!-- Image Icon -->
      <div class="w-18 h-18 mb-6 flex items-center justify-center">
        <img :src="imageSrc" :alt="imageAlt" class="h-24 w-24 opacity-80" />
      </div>

      <!-- Title -->
      <h2 class="mb-4 text-center text-[23px] font-bold text-gray-300">
        {{ title }}
      </h2>

      <!-- Subtitle (optional) -->
      <p v-if="subtitle" class="mb-16 text-center text-body text-gray-300">
        {{ subtitle }}
      </p>

      <!-- Spacing when no subtitle -->
      <div v-else class="mb-12"></div>

      <!-- Confirm Button -->
      <BaseButton @click="handleConfirm">{{ confirmButtonText }}</BaseButton>
    </div>
  </div>
</template>
