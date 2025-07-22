import { ref } from "vue";
import { useRouter } from "vue-router";
import { postSignup } from "@/composables/api/useUserApi";

export const useSignup = () => {
  const user = ref(null);

  const signupAndHandle = async (formData) => {
    try {
      const res = await postSignup(formData);
      user.value = res.data;
      return { success: true, data: res.data };
    } catch (e) {
      return { success: false, error: e };
    }
  };

  return { user, signupAndHandle };
};
