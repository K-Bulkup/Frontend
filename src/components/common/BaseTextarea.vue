<script setup>
import { computed, watch, ref } from "vue";

const props = defineProps({
  modelValue: String,
  label: String,
  description: String,
  placeholder: String,
  maxlength: {
    type: Number,
    default: 500,
  },
  minlength: {
    type: Number,
    default: 10,
  },
  rows: {
    type: Number,
    default: 4,
  },
});

const emit = defineEmits(["update:modelValue"]);

const charCount = computed(() => props.modelValue?.length || 0);

const isTooShort = computed(
  () => charCount.value > 0 && charCount.value < props.minlength,
);
</script>

<template>
  <div class="mb-6">
    <h2 class="mb-3 text-body font-semibold text-white">{{ label }}</h2>
    <p class="mb-4 text-input text-gray-200">{{ description }}</p>

    <div class="relative">
      <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :rows="rows"
        class="h-24 w-full resize-none rounded-r15 bg-gray-custom p-4 text-body2 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
      ></textarea>

      <div
        class="mt-2 flex justify-between text-body2"
        :class="isTooShort ? 'text-red-500' : 'text-gray-300'"
      >
        <span>최소 {{ minlength }}자 이상 작성해주세요</span>
        <span>{{ charCount }}/{{ maxlength }}</span>
      </div>
    </div>
  </div>
</template>
