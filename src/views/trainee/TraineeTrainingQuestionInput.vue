<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseTextarea from "@/components/common/BaseTextarea.vue";
import { postQnAQuestion } from "@/composables/api/useQnAQuestion";
const router = useRouter();
const route = useRoute();

// Form data
const questionTitle = ref("");
const questionContent = ref("");
// 중복 제출 방지
const isSubmitting = ref(false);

// Constants
const trainingId = Number(route.params.trainingId);
const courseTitle = route.query.courseTitle;

// Computed properties
const isTitleValid = computed(() => {
  return questionTitle.value.length >= 5;
});

const isContentValid = computed(() => {
  return questionContent.value.length >= 10;
});

const isFormValid = computed(() => isTitleValid.value && isContentValid.value);

// Methods
const handleBack = () => router.back();

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return;
  if (Number.isNaN(trainingId)) {
    console.error("유효하지 않은 trainingId:", route.params.trainingId);
    return;
  }

  isSubmitting.value = true;
  try {
    await postQnAQuestion(
      trainingId,
      questionTitle.value.trim(),
      questionContent.value.trim(),
    );
    router.back();
  } catch (err) {
    console.error("질문 등록 실패:", err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-realBlack text-white">
    <BaseHeader title="잘문 등록하기" @back="handleBack" class="mt-4" />

    <div class="mx-7 mb-6">
      <!-- Course Title -->
      <div class="mb-6 rounded-xl border border-white bg-realBlack p-6">
        <h1 class="text-center text-heading font-semibold text-white">
          {{ courseTitle }}
        </h1>
      </div>
      <!-- Review Section -->
      <div class="mt-8">
        <BaseTextarea
          v-model="questionTitle"
          label="질문 제목을 작성해주세요"
          description=""
          placeholder=""
          :maxlength="100"
          :minlength="5"
          :rows="5"
        />
      </div>

      <!-- Review Section -->
      <div class="mt-8">
        <BaseTextarea
          v-model="questionContent"
          label="질문 내용을 작성해주세요"
          description=""
          placeholder=""
          :maxlength="500"
          :minlength="10"
          :rows="5"
        />
      </div>
    </div>

    <!-- Submit Button -->
    <div class="mx-7 mt-8">
      <button
        @click="handleSubmit"
        :disabled="!isFormValid || isSubmitting"
        :class="[
          'w-full rounded-xl py-3 text-body font-semibold transition-colors duration-200',
          isFormValid
            ? 'border border-gray-100 bg-black text-white hover:opacity-80'
            : 'cursor-not-allowed border border-gray-700 bg-gray-700 text-gray-200',
        ]"
      >
        질문 작성 완료
      </button>
    </div>
  </div>
</template>
