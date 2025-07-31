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
  <div class="flex w-full flex-col items-center pb-3">
    <div
      class="flex items-center gap-3 rounded-xl border bg-gray-100 px-4 py-3"
      :class="[
        isInvalid ? 'border-error' : 'border-gray-200',
        'transition duration-200',
      ]"
      style="width: 360px; height: 60px"
    >
      <slot name="icon" />

      <input
        v-bind="inputAttrs"
        :value="modelValue"
        @input="(e) => emit('update:modelValue', e.target.value)"
        :type="type"
        :placeholder="placeholder"
        class="placeholder-gray700 flex-1 bg-transparent text-sm text-black outline-none"
        :class="$slots.icon ? 'ml-2' : ''"
      />
    </div>
    <!-- 에러 메시지를 왼쪽 정렬로 변경 -->
    <div v-if="isInvalid && errorMessage" class="w-full max-w-[360px]">
      <p class="pl-[5px] pt-[6px] text-left text-caption text-error">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>
