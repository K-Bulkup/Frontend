<script setup>
defineProps({
  variant: {
    type: String,
    default: "secondary",
  },
});
</script>

<template>
  <span
    class="rounded-md px-3 py-1 text-caption"
    :class="{
      'border border-gray-200 bg-white text-gray-800': variant === 'secondary',
      'border border-gray-200 bg-primary text-gray-800': variant === 'primary',
    }"
  >
    <slot />
  </span>
</template>
