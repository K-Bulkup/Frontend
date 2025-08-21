import { useRouter } from "vue-router";
import { postConnectAccount } from "@/composables/api/useAssetApi";

export const useAccountConnect = () => {
  const connectAccount = async ({ bank, accountNumber }) => {
    try {
      const bankName = typeof bank === "string" ? bank : bank?.name;
      const cleanAccount = String(accountNumber ?? "")
        .replaceAll("-", "")
        .replaceAll(" ", "");

      const { data } = await postConnectAccount(bankName, cleanAccount);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.message || error.message,
      };
    }
  };

  return { connectAccount };
};
