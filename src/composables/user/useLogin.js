import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { postLogin } from "@/composables/api/useUserApi";

export const useLogin = () => {
  const authStore = useAuthStore();

  const loginAndHandle = async (formData) => {
    console.log("로그인 타입:", formData.loginType); // 추가된 콘솔 로그
    try {
      const { data } = await postLogin(formData);
      if (data.accessToken) {
        console.log("setToken에 전달될 accessToken:", data.accessToken); // 이 줄을 추가합니다.
        console.log("백엔드에서 받은 roles:", data.roles); // 추가된 콘솔 로그
        authStore.setToken(data.accessToken); // 토큰 설정
        authStore.setRole(formData.role); // 역할 설정 (formData.role 사용)

        return { success: true, error: null };
      } else {
        return { success: false, error: "로그인 실패: 유효한 토큰을 받지 못했습니다." };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { loginAndHandle };
};
