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
        'font-bold',
        variant === 'status' ? 'text-title' : 'text-heading',
      ]"
    >
      {{ title }}
    </h2>

    <p class="mt-1 text-subtext text-gray-200">
      {{ subtitle }}
    </p>
  </div>
</template>
