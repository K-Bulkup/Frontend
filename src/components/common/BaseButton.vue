<script setup>
defineProps({
  isDisabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <button
    :class="[
      'text-heading w-[90%] rounded-xl font-medium',
      isDisabled
        ? 'cursor-not-allowed border-gray-600 bg-gray-700 text-gray-400'
        : 'bg-black text-white hover:opacity-80',
      'border-gray100 border',
      'py-[12px]',
    ]"
    :disabled="isDisabled"
  >
    <slot />
  </button>
</template>
