<script setup>
defineProps({
  text: String,
  disabled: Boolean,
  variant: {
    type: String,
    default: "primary",
  },
});
</script>

<template>
  <button
    :disabled="disabled"
    class="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-body transition-colors"
    :class="[
      disabled
        ? 'bg-gray-custom font-medium text-gray-500'
        : variant === 'primary'
          ? 'bg-primary font-bold text-black transition hover:opacity-90'
          : 'bg-gray-100 font-bold text-black',
    ]"
  >
    <slot name="icon"></slot>

    <span>{{ text }}</span>
  </button>
</template>
