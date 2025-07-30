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
    class="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-body font-bold transition-colors"
    :class="[
      disabled
        ? 'bg-gray-800 text-gray-700'
        : variant === 'primary'
          ? 'bg-primary text-black'
          : 'bg-gray-100 text-black',
    ]"
  >
    <slot name="icon"></slot>

    <span>{{ text }}</span>
  </button>
</template>
