<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    const code = router.currentRoute.value.query.code;
    if (!code) {
      console.error('카카오 인증 코드가 없습니다.');
      alert('카카오 로그인 처리 중 오류가 발생했습니다: 인증 코드 누락.');
      router.replace('/login');
      return;
    }

    // 백엔드로부터 사용자 상태 및 JWT를 받아오는 API 호출
    // 이 엔드포인트는 백엔드에서 구현되어야 합니다.
    const response = await apiClient.get(`/api/common/auth/kakao/login-status?code=${code}`);
    const { newUser, profile, availableRoles, accessToken } = response.data;

    if (newUser) {
      console.log('KakaoCallbackPage: New user detected. Redirecting to /login with query:', { kakaoSignup: 'true', kakaoProfile: profile, availableRoles: availableRoles });
      router.replace({ path: '/login', query: { kakaoSignup: 'true', kakaoProfile: JSON.stringify(profile), availableRoles: JSON.stringify(availableRoles) } });
    } else {
      console.log('KakaoCallbackPage: Existing user. Redirecting based on role:', availableRoles[0]);
      authStore.setToken(accessToken);
      authStore.setRole(availableRoles[0]); // 단일 역할이라고 가정
      router.replace(availableRoles[0] === 'TRAINER' ? '/trainer/mypage' : '/trainee/mypage');
    }
  } catch (error) {
    console.error('카카오 로그인 상태 확인 중 오류 발생:', error);
    alert('카카오 로그인 처리 중 오류가 발생했습니다.');
    router.replace('/login');
  }
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <p class="text-white text-lg">카카오 로그인 처리 중...</p>
  </div>
</template>
