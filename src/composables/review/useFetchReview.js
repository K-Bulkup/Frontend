import { ref } from "vue";
import { getTraineeReview as fetchTraineeReview } from "@/composables/api/trainee/mypage/traineeReviewApi.js";

export const useTraineeReview = () => {
  const reviewData = ref(null);
  const errorMessage = ref(null);
  const isLoading = ref(false);

  const getTraineeReview = async (trainingId) => {
    isLoading.value = true;
    try {
      const response = await fetchTraineeReview(trainingId);
      reviewData.value = response.data.data;
      return { success: true, data: response.data };
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message;
      return { success: false, error: errorMessage.value };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    getTraineeReview,
    reviewData,
    errorMessage,
    isLoading,
  };
};
