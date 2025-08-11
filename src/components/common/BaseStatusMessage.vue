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
    <div v-if="icon" class="mb-4 text-display">
      {{ icon }}
    </div>

    <h2
      :class="[
        'text-white',
        variant === 'status' ? 'text-title' : 'text-subTitle font-semibold',
      ]"
    >
      {{ title }}
    </h2>

    <p class="text-input mt-1 text-gray-50">
      {{ subtitle }}
    </p>
  </div>
</template>
