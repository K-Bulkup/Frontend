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
  errorMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);
const inputAttrs = useAttrs();
</script>

<template>
  <div class="w-[90%]">
    <div
      class="flex flex-col gap-[4px] rounded-xl border bg-gray-100 px-[16px] py-[12px]"
      :class="[
        isInvalid ? 'border-error' : 'border-gray200',
        'transition duration-200',
      ]"
    >
      <div class="flex items-center">
        <slot name="icon" />

        <input
          v-bind="inputAttrs"
          :value="modelValue"
          @input="(e) => emit('update:modelValue', e.target.value)"
          :type="type"
          :placeholder="placeholder"
          class="placeholder-gray700 ml-2 flex-1 bg-transparent text-subtext text-black outline-none"
        />
      </div>
    </div>
    <p
      v-if="isInvalid && errorMessage"
      class="flex items-center gap-1 pl-[16px] pt-[6px] text-caption text-error"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
