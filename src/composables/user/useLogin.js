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
        authStore.setToken(data.accessToken); // 토큰 설정
        authStore.setRole(data.roles[0]); // 역할 설정 (roles 배열의 첫 번째 요소 사용)
        authStore.setUserId(data.userId);

        return { success: true, error: null };
      } else {
        return {
          success: false,
          error: "로그인 실패: 유효한 토큰을 받지 못했습니다.",
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { loginAndHandle };
};
