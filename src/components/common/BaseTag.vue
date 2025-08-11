<script setup>
defineProps({
  text: {
    type: String,
    default: "tag",
  },
});
</script>

<template>
  <div class="rounded-bt flex h-5 items-center bg-gray-600 px-3 py-1">
    <span class="text-button text-white">{{ text }}</span>
  </div>
</template>
