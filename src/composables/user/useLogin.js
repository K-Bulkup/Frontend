import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { postLogin } from "@/composables/api/useUserApi";

export const useLogin = () => {
  const authStore = useAuthStore();

  const loginAndHandle = async (formData) => {
    try {
      const { data } = await postLogin(formData);
      if (data.accessToken) {
        console.log("setToken에 전달될 accessToken:", data.accessToken); // 이 줄을 추가합니다.
        authStore.setToken(data.accessToken); // 토큰 설정
        authStore.setRole(formData.role); // 역할 설정 (사용자 선택 역할 사용)

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
