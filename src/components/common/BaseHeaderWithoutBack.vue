<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <header class="flex items-center justify-center px-5 pt-5">
    <h2 class="font-bold text-white">{{ title }}</h2>
  </header>
</template>
