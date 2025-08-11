<script setup>
const modelValue = defineModel();

defineProps({
  options: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="flex w-full items-center gap-2.5">
    <button
      v-for="option in options"
      :key="option"
      type="button"
      @click="modelValue = option"
      :class="[
        'text-button rounded-bt flex-1 border py-3 text-center transition-colors',
        modelValue === option
          ? 'border-primary bg-primary/30'
          : 'border-gray-800 bg-transparent hover:hover:bg-[#353535]/60',
      ]"
    >
      {{ option }}
    </button>
  </div>
</template>
