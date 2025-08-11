<script setup>
const modelValue = defineModel();

defineProps({
  options: {
    type: Array,
    required: true,
  },
  valueKey: {
    type: String,
    default: "key",
  },
  labelKey: {
    type: String,
    default: "label",
  },
});
</script>

<template>
  <div class="flex w-full items-center gap-2.5">
    <button
      v-for="option in options"
      :key="typeof option === 'object' ? option[valueKey] : option"
      type="button"
      @click="
        modelValue = typeof option === 'object' ? option[valueKey] : option
      "
      :class="[
        'rounded-pill flex-1 border py-3 text-center text-button transition-colors',
        modelValue === (typeof option === 'object' ? option[valueKey] : option)
          ? 'border-primary bg-primary/30 text-white'
          : 'border-gray-800 bg-transparent text-white hover:bg-[#353535]/60',
      ]"
    >
      {{ typeof option === "object" ? option[labelKey] : option }}
    </button>
  </div>
</template>
