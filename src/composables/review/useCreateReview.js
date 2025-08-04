import { ref } from "vue";
import { submitTraineeReview as postTraineeReview } from "@/composables/api/trainee/mypage/traineeReviewApi.js";

export const useSubmitReview = () => {
  const isSubmitting = ref(false);
  const submitError = ref(null);

  const submitReview = async (trainingId, reviewData) => {
    isSubmitting.value = true;
    submitError.value = null;

    try {
      const response = await postTraineeReview(trainingId, reviewData);
      return { success: true, data: response.data };
    } catch (error) {
      submitError.value = error.response?.data?.message || error.message;
      return { success: false, error: submitError.value };
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    submitReview,
    isSubmitting,
    submitError,
  };
};
