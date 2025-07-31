<script setup>
defineProps({
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
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <div>
    <label class="mb-2 block text-subtext text-gray-50">{{ label }}</label>
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
