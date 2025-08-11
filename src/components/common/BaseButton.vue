<script setup>
defineProps({
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <button
    :class="[
      'text-subTitle w-full rounded-xl font-semibold',
      'bg-primary text-gray-600 hover:opacity-80',
      isDisabled ? 'cursor-not-allowed' : '',
      'py-[12px]',
    ]"
    :disabled="isDisabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>
