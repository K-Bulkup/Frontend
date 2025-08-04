import { ref } from "vue";
import { useRouter } from "vue-router";
import { postSignup } from "@/composables/api/useUserApi";

export const useSignup = () => {
  const user = ref(null);

  const signupAndHandle = async (formData) => {
    try {
      const res = await postSignup(formData);
      user.value = res.data;
      return res.data; // API 응답 데이터를 직접 반환
    } catch (e) {
      return { success: false, error: e }; // 실패 시 일관된 객체 반환
    }
  };

  return { user, signupAndHandle };
};
