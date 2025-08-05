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
      'w-full rounded-xl text-heading font-medium',
      'bg-black text-white hover:opacity-80',
      isDisabled ? 'cursor-not-allowed' : '',
      'border-gray100 border',
      'py-[12px]',
    ]"
    :disabled="isDisabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>
