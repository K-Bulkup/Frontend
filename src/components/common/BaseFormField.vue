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
  isTextarea: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 4,
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
  "text-subtext",
  props.variant === "dark" ? "text-gray-50" : "text-black",
]);
</script>

<template>
  <div>
    <label :class="labelClasses">{{ label }}</label>
    <textarea
      v-if="isTextarea"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :rows="rows"
      class="w-full resize-none rounded-xl border-none bg-gray-100 p-4 text-body text-black outline-none placeholder:text-gray-400"
    ></textarea>
    <input
      v-else
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      class="w-full rounded-xl border-none bg-gray-100 p-4 text-body text-black outline-none placeholder:text-gray-400"
    />
  </div>
</template>
