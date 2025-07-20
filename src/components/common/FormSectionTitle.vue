<script setup>
defineProps({
  title: String,
  subtitle: String,
});
</script>

<template>
  <div class="mb-6 text-center">
    <h2 class="text-title font-bold text-white">{{ title }}</h2>
    <p class="text-subtext mt-1 text-gray-200">{{ subtitle }}</p>
  </div>
</template>
