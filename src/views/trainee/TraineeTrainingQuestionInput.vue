<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { postQnAQuestion } from "@/composables/api/useQnAQuestion";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseTextarea from "@/components/common/BaseTextarea.vue";
import BaseButton from "@/components/common/BaseButton.vue";
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
  <div class="flex min-h-screen flex-col pb-20">
    <BaseHeader title="잘문 등록하기" @back="handleBack" />

    <div class="flex-grow px-7">
      <div class="mb-6">
        <!-- Course Title -->
        <h2 class="mb-6 mt-8 text-subTitle font-semibold">
          {{ courseTitle }}
        </h2>
        <!-- Review Section -->

        <div class="title-compact mt-10">
          <BaseTextarea
            v-model="questionTitle"
            label="질문 제목을 작성해주세요"
            description=""
            placeholder=""
            :maxlength="100"
            :minlength="5"
            :rows="2"
          />
        </div>

        <!-- Review Section -->
        <div class="mt-14">
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
    </div>

    <!-- Submit Button -->
    <div class="mt-10">
      <BaseButton
        @click="handleSubmit"
        :disabled="!isFormValid || isSubmitting"
        :class="w - full"
      >
        질문 작성 완료
      </BaseButton>
    </div>
  </div>
</template>
<style scoped>
/* 제목 BaseTextarea 안의 실제 <textarea>에만 적용 */
.title-compact :deep(textarea) {
  height: 58px; /* 원하는 값으로 조절 (예: 36px, 40px, 44px 등) */
  min-height: 44px; /* 컴포넌트의 기본 min-height 무력화 */
  padding-top: 8px; /* 필요하면 안쪽 여백도 살짝 줄이기 */
  padding-bottom: 8px;
  line-height: 1.25rem; /* 텍스트 세로 정렬 안정화(선택) */
}
</style>
