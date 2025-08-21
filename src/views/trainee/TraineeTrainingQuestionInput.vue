<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { postQnAQuestion } from "@/composables/api/useQnAQuestion";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";
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
const TITLE_MIN = 5;
const TITLE_MAX = 100;
const CONTENT_MIN = 10;
const CONTENT_MAX = 500;

// Methods
const titleLen = computed(() => (questionTitle.value ?? "").length);
const contentLen = computed(() => (questionContent.value ?? "").length);
const isTitleShort = computed(() => titleLen.value < TITLE_MIN);
const isContentShort = computed(() => contentLen.value < CONTENT_MIN);
const canSubmit = computed(
  () =>
    !isSubmitting.value &&
    !Number.isNaN(trainingId) &&
    !isTitleShort.value &&
    !isContentShort.value,
);

const handleBack = () => router.back();

const handleSubmit = async () => {
  if (isSubmitting.value) return;
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
  <div class="flex flex-col pb-20">
    <BaseHeader title="잘문 등록하기" @back="handleBack" />

    <div class="relative flex-grow px-6">
      <div class="mb-6">
        <!-- Course Title -->
        <h2 class="mb-6 mt-10 text-subTitle font-semibold">
          {{ courseTitle }}
        </h2>
        <!-- Review Section -->

        <div class="mt-10">
          <BaseFormField
            variant="dark"
            v-model="questionTitle"
            label="질문 제목을 작성해주세요"
            placeholder=""
            :rows="3"
            :is-textarea="true"
          />
          <!-- 안내/카운터 줄 -->
          <div
            class="mt-1 flex items-center justify-between text-body2 text-gray-300"
          >
            <span> 최소 {{ TITLE_MIN }}자 이상 작성해주세요 </span>
            <span> {{ titleLen }} / {{ TITLE_MAX }} </span>
          </div>
        </div>
        <!-- Review Section -->
        <div class="mt-10">
          <BaseFormField
            v-model="questionContent"
            label="질문 내용을 작성해주세요"
            placeholder=""
            variant="dark"
            :isTextarea="true"
            :rows="5"
          />
          <!-- 안내/카운터 줄 -->
          <div
            class="mt-1 flex items-center justify-between text-body2 text-gray-300"
          >
            <span> 최소 {{ CONTENT_MIN }}자 이상 작성해주세요 </span>
            <span> {{ contentLen }} / {{ CONTENT_MAX }} </span>
          </div>
        </div>
      </div>
      <!-- Submit Button -->
      <div>
        <BaseButton
          @click="handleSubmit"
          :isDisabled="!canSubmit"
          class="fixed bottom-24"
        >
          질문 작성 완료
        </BaseButton>
      </div>
    </div>
  </div>
</template>
