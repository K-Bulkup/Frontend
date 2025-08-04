import { useRouter } from "vue-router";
import { postConnectAccount } from "@/composables/api/useAssetApi";

export const useAccountConnect = () => {
  const router = useRouter();

  const connectAccount = async (selectedBank) => {
    try {
      const response = await postConnectAccount(selectedBank.name);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  };

  return { connectAccount };
};
