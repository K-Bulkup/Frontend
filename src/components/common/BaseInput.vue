<script setup>
import { useAttrs, ref } from "vue";

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

const isClicked = ref(false);

// 클릭 모션 처리
const handleClick = () => {
  isClicked.value = true;
  setTimeout(() => {
    isClicked.value = false;
  }, 150);
};
</script>

<template>
  <div class="flex w-full flex-col items-center text-input">
    <div
      @click="handleClick"
      class="flex cursor-text items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 transition-all duration-150"
      :class="[
        isInvalid ? 'border-error' : 'border-gray-900',
        isClicked ? 'scale-[0.98] shadow-inner' : 'scale-100 shadow-sm',
      ]"
      style="width: 332px; height: 64px"
    >
      <slot name="icon" />

      <input
        v-bind="inputAttrs"
        :value="modelValue"
        @input="(e) => emit('update:modelValue', e.target.value)"
        :type="type"
        :placeholder="placeholder"
        class="pointer-events-auto flex-1 appearance-none !bg-transparent text-white placeholder-gray-500 outline-none [caret-color:#fff] focus:outline-none focus:ring-0"
        :class="$slots.icon ? 'ml-2' : ''"
      />
    </div>
    <!-- 에러 메시지를 왼쪽 정렬로 변경 -->
    <div v-if="isInvalid && errorMessage" class="w-full max-w-[360px]">
      <p class="pl-5 pt-1 text-body2 text-error">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* 크롬/사파리 자동완성 및 기본 배경 강제 덮기 */
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus) {
  -webkit-text-fill-color: #ffffff;
  caret-color: #ffffff;
  -webkit-box-shadow: 0 0 0 1000px #424242 inset; /* bg-gray-600 */
  box-shadow: 0 0 0 1000px #424242 inset;
  transition: background-color 9999s ease-out 0s;
}
/* 파이어폭스 */
:deep(input:autofill) {
  color: #ffffff;
  box-shadow: 0 0 0 1000px #424242 inset;
}
</style>
