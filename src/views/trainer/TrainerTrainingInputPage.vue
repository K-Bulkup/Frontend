<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// 공통 컴포넌트 import
import BaseButton from "@/components/common/BaseButton.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";

// 상수
const CATEGORIES = [
  "재무설계",
  "현금관리",
  "신용과 부채관리",
  "위험관리와 보험설계",
  "투자설계",
  "세금설계",
  "기타",
];

// ref, reactive
const router = useRouter();
const selectedCategory = ref(null);

// computed, watch
const isNextButtonDisabled = computed(() => !selectedCategory.value);

// 함수
const handleSelectCategory = (category) => {
  selectedCategory.value = category;
};

const handleNext = () => {
  if (isNextButtonDisabled.value) return;
  console.log("Selected category:", selectedCategory.value);
  // router.push('/trainer/training/next-step');
};
</script>

<template>
  <div
    class="flex min-h-screen flex-col justify-between bg-realBlack px-6 py-20"
  >
    <div>
      <BaseStatusMessage
        title="어떤 트레이닝을 하실 건가요?"
        subtitle="원하시는 카테고리를 선택해주세요"
        variant="guide"
      />

      <div class="mt-12 flex flex-col space-y-3.5">
        <button
          v-for="category in CATEGORIES"
          :key="category"
          @click="handleSelectCategory(category)"
          :class="[
            'w-full rounded-xl border-2 border-solid py-3 text-center text-base transition-colors',
            selectedCategory === category
              ? 'border-primary bg-primary text-black'
              : 'border-gray-200 bg-gray-100 text-black hover:bg-gray-200',
          ]"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <div class="mt-10">
      <BaseButton @click="handleNext" :isDisabled="isNextButtonDisabled"
        >다음</BaseButton
      >
    </div>
  </div>
</template>

<style scoped></style>
