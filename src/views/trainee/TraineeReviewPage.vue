<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTraineeReview } from "@/composables/review/useFetchReview.js";
import { useSubmitReview } from "@/composables/review/useCreateReview.js";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseTextarea from "@/components/common/BaseTextarea.vue";
import ReviewSuccessModal from "@/components/common/ActionStateModal.vue";
import ReviewFailureModal from "@/components/common/ConnectFailureModal.vue";

const router = useRouter();
const route = useRoute();

const { getTraineeReview, reviewData, errorMessage, isLoading } =
  useTraineeReview();
const { submitReview: submitReviewRequest } = useSubmitReview();

const isSuccessModalVisible = ref(false);
const isFailureModalVisible = ref(false);
const rating = ref(0);
const reviewText = ref("");
const trainingId = parseInt(route.params.trainingId);

const isFormValid = computed(() => {
  return rating.value > 0 && reviewText.value.length >= 10;
});

const handleBack = () => {
  router.back();
};

const setRating = (star) => {
  rating.value = star;
};

const submitReview = async () => {
  if (!isFormValid.value) return;

  const reviewPayload = {
    rating: rating.value,
    content: reviewText.value,
  };

  const { success } = await submitReviewRequest(trainingId, reviewPayload);

  if (success) {
    isSuccessModalVisible.value = true;
  } else {
    isFailureModalVisible.value = true;
  }
};

onMounted(async () => {
  const trainingId = parseInt(route.params.trainingId);
  await getTraineeReview(trainingId);
});
</script>
<template>
  <div class="min-h-screen bg-realBlack text-white">
    <!-- Header -->
    <BaseHeader title="리뷰 작성" @back="handleBack" class="mt-4" />

    <!-- Course Info Card -->
    <div class="mx-7 mb-6 rounded-xl border border-gray-100 bg-black p-6">
      <h3 class="text-center text-body font-semibold text-white">
        {{ reviewData?.title || "강의 정보를 불러오는 중..." }}
      </h3>
    </div>

    <!-- Rating Section -->
    <div class="mx-7 mb-6">
      <h2 class="text-heading mb-3 font-semibold text-white">
        강의는 어떠셨나요?
      </h2>
      <p class="text-subtext mb-6 text-gray-200">별점을 선택해주세요</p>

      <!-- Star Rating -->
      <div class="mb-8 flex justify-center gap-4">
        <button
          v-for="star in 5"
          :key="star"
          @click="setRating(star)"
          class="transition-colors duration-200"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L15.09 8.26L22 9L17 13.74L18.18 20.42L12 17.27L5.82 20.42L7 13.74L2 9L8.91 8.26L12 2Z"
              :stroke="star <= rating ? '#FBE081' : '#D0D0D0'"
              :fill="star <= rating ? '#FBE081' : 'none'"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- Review Section -->
      <div class="mt-8">
        <BaseTextarea
          v-model="reviewText"
          label="리뷰를 작성해주세요"
          description="강의에 대한 솔직한 후기를 남겨주세요"
          placeholder="리뷰를 입력해주세요..."
          :maxlength="500"
          :minlength="10"
          :rows="5"
        />
      </div>
    </div>

    <!-- Submit Button -->
    <div class="mx-7 mt-8">
      <button
        @click="submitReview"
        :disabled="!isFormValid"
        :class="[
          'w-full rounded-xl py-3 text-body font-semibold transition-colors duration-200',
          isFormValid
            ? 'border border-gray-100 bg-black text-white hover:opacity-80'
            : 'cursor-not-allowed border border-gray-700 bg-gray-700 text-gray-200',
        ]"
      >
        리뷰 작성 완료
      </button>
    </div>
    <ReviewSuccessModal
      v-if="isSuccessModalVisible"
      title="리뷰가 등록되었습니다"
      subtitle="소중한 후기 감사합니다!"
      @close="router.push('/trainee/mypage')"
    />
    <ReviewFailureModal
      v-if="isFailureModalVisible"
      title="리뷰 등록이 실패했습니다"
      subtitle="다시 시도해주세요!"
      @close="isFailureModalVisible = false"
    />
  </div>
</template>
