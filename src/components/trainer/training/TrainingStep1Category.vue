<script setup>
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const FINANCE_CATEGORIES = [
  "재무설계",
  "현금관리",
  "신용과 부채관리",
  "위험관리와 보험설계",
  "투자설계",
  "세금설계",
  "기타",
];

const handleCategorySelect = (category) => {
  emit("update:modelValue", category);
};
</script>

<template>
  <div>
    <BaseStatusMessage
      title="어떤 트레이닝을 하실 건가요?"
      subtitle="원하시는 카테고리를 선택해주세요"
      variant="guide"
    />
    <div class="mt-12 flex flex-col space-y-3.5">
      <button
        v-for="category in FINANCE_CATEGORIES"
        :key="category"
        @click="handleCategorySelect(category)"
        :class="[
          'w-full rounded-xl border-2 border-solid py-3 text-center text-body transition-colors',
          modelValue === category
            ? 'border-primary bg-primary text-black'
            : 'border-gray-100 bg-gray-100 text-black hover:bg-gray-200',
        ]"
      >
        {{ category }}
      </button>
    </div>
  </div>
</template>
