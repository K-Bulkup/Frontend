import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export const useLogin = () => {
  const authStore = useAuthStore();

  const loginAndHandle = async (formData) => {
    const { success, error } = await authStore.login(formData);
    return { success, error };
  };

  return { loginAndHandle };
};
