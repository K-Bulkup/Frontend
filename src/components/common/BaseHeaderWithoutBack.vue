<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <header class="flex items-center justify-center px-5 pb-3 pt-8">
    <h2 class="text-white">{{ title }}</h2>
  </header>
</template>
