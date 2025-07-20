<script setup>
import { useAttrs } from "vue";

const props = defineProps({
  modelValue: String,
  placeholder: String,
  type: {
    type: String,
    default: "text",
  },
  isInvalid: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
const inputAttrs = useAttrs();
</script>

<template>
  <div
    class="flex w-[90%] items-center rounded-xl border bg-gray-100 px-[16px] py-[12px]"
    :class="[
      isInvalid ? 'border-error' : 'border-gray200',
      'transition duration-200 focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary',
    ]"
  >
    <slot name="icon" />

    <input
      v-bind="inputAttrs"
      :value="modelValue"
      @input="(e) => emit('update:modelValue', e.target.value)"
      :type="type"
      :placeholder="placeholder"
      class="text-subtext placeholder-gray700 ml-2 flex-1 bg-transparent text-black outline-none"
    />
  </div>
</template>
