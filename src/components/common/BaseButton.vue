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
      'mx-auto block h-btn w-btn rounded-xl font-semibold',
      // 내용 중앙 정렬
      'flex items-center justify-center gap-2 text-center',
      // 색/상태
      'text-background bg-primary transition hover:opacity-90',
      isDisabled ? 'cursor-not-allowed opacity-80' : '',
    ]"
  >
    <slot />
  </button>
</template>
