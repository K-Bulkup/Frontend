<script setup>
defineProps({
  icon: String,
  title: String,
  subtitle: String,
  variant: {
    type: String,
    default: "guide",
  },
});
</script>

<template>
  <div class="mb-6 text-center">
    <div v-if="icon" class="mb-4">
      {{ icon }}
    </div>

    <div class="pt-10 text-[18px] font-semibold text-gray-300">
      {{ title }}
    </div>

    <p class="mt-1 text-input text-gray-300">
      {{ subtitle }}
    </p>
  </div>
</template>
