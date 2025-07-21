import { ref } from "vue";
import { useRouter } from "vue-router";
import { postSignup } from "@/composables/api/useUserApi";

export const useSignup = () => {
  const user = ref(null);
  const router = useRouter();

  const signupAndHandle = async (formData) => {
    try {
      const res = await postSignup(formData);
      user.value = res.data;
      alert("회원가입 성공:", res.data);
      router.push("/");
    } catch (e) {
      alert("회원가입에 실패했습니다.");
    }
  };

  return { user, signupAndHandle };
};
