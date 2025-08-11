<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: "",
  },
  variant: {
    type: String,
    default: "light", // 'light' | 'dark'
  },
});

defineEmits(["update:modelValue"]);

const labelClasses = computed(() => [
  "mb-2",
  "block",
  "text-input",
  props.variant === "dark" ? "text-gray-50" : "text-black",
]);
</script>

<template>
  <div>
    <label :class="labelClasses">{{ label }}</label>
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="bg-gray-custom rounded-15 w-full border-none p-4 text-center text-body text-white outline-none placeholder:text-gray-300"
    />
  </div>
</template>
