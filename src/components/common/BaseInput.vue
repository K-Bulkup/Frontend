<template>
  <input
    v-bind="$attrs"
    :type="type"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="w-full px-4 py-2 border border-gray200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
  />
</template>
<script setup>
defineProps({
  modelValue: [String, Number],
  type: { type: String, default: 'text' },
});
</script>
