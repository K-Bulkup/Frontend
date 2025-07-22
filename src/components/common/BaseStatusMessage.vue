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
    <!-- 아이콘 -->
    <div v-if="icon" class="mb-3 text-display">
      {{ icon }}
    </div>

    <!-- 제목 -->
    <h2
      :class="[
        'font-bold text-white',
        variant === 'status' ? 'text-title' : 'text-heading',
      ]"
    >
      {{ title }}
    </h2>

    <!-- 부제목 -->
    <p class="mt-1 text-subtext text-gray-200">
      {{ subtitle }}
    </p>
  </div>
</template>
