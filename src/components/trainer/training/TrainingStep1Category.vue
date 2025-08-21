<script setup>
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import SelectCategory from "@/components/trainer/training/SelectCategory.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const FINANCE_CATEGORIES = [
  "재무 설계",
  "현금 관리",
  "신용과 부채 관리",
  "위험 관리와 보험 설계",
  "투자 설계",
  "세금 설계",
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
      <SelectCategory
        v-for="category in FINANCE_CATEGORIES"
        :key="category"
        :label="category"
        :isSelected="modelValue === category"
        @select="handleCategorySelect"
      />
    </div>
  </div>
</template>
