import { ref } from "vue";
import { useRouter } from "vue-router";
import { getTraineeAsset as fetchTraineeAsset } from "@/composables/api/useAssetApi";

export const useTraineeAsset = () => {
  const router = useRouter();
  const assetData = ref(null);
  const errorMessage = ref(null);

  const getTraineeAsset = async (id) => {
    try {
      const response = await fetchTraineeAsset(id);
      console.log("response : ", response);
      assetData.value = response.data.data;

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      errorMessage.value = error.response?.data?.message || error.message;
      return {
        success: false,
        error: errorMessage.value,
      };
    }
  };

  return {
    getTraineeAsset,
    assetData,
    errorMessage,
  };
};
