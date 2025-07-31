<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <header class="mb-6 flex h-10 items-center justify-center">
    <h2 class="text-heading text-white">{{ title }}</h2>
    <div class="w-8"></div>
  </header>
</template>
