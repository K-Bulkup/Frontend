<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-black hover:bg-yellow-300"
    @click="onClick"
  >
    <slot />
  </button>
</template>
<script setup>
const props = defineProps({
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

function onClick(event) {
  emit('click', event);
}
</script>
