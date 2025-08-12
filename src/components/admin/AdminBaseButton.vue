<script setup>
defineProps({
  isDisabled: { type: Boolean, default: false },
  type: { type: String, default: "button" },
});
const emit = defineEmits(["click"]);
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    @click="emit('click', $event)"
    :class="[
      // 크기 & 배치
      'h-btn w-1/2 rounded-xl font-medium', // 너비를 1/5로 설정
      // 내용 중앙 정렬
      'flex items-center justify-center gap-2 text-center',
      // 색/상태
      'bg-primary text-background transition hover:opacity-90',
      isDisabled ? 'cursor-not-allowed opacity-80' : '',
    ]"
  >
    <slot />
  </button>
</template>
