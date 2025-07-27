<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const code = route.query.code;
  const state = route.query.state;

  if (code && state) {
    try {
      const response = await apiClient.get(`/api/common/auth/naver/callback?code=${code}&state=${state}`);
      const { newUser, profile, availableRoles } = response.data;
      console.log('NaverCallbackPage: Received backend response:', response.data); // 추가된 로그
      console.log('NaverCallbackPage: newUser is', newUser); // newUser 값 확인

      if (newUser) {
        console.log('NaverCallbackPage: Entering new user flow.'); // 신규 사용자 흐름 진입 로그
        router.replace({ path: '/login', query: { naverSignup: 'true', naverProfile: JSON.stringify(profile), availableRoles: JSON.stringify(availableRoles) } });
      } else if (newUser === false) {
        console.log('NaverCallbackPage: Entering existing user flow.'); // 기존 사용자 흐름 진입 로그
        // 기존 사용자: 역할 선택 페이지 또는 바로 로그인 처리
        if (availableRoles && availableRoles.length > 1) {
          console.log('NaverCallbackPage: Existing user with multiple roles.'); // 기존 사용자, 여러 역할
          // 기존 사용자: 로그인 페이지로 이동하여 역할 선택 유도
          router.replace({ path: '/login', query: { naverLogin: 'true', availableRoles: JSON.stringify(availableRoles), email: profile.email } });
        } else if (availableRoles && availableRoles.length === 1) {
          console.log('NaverCallbackPage: Existing user with single role.'); // 기존 사용자, 단일 역할
          // 역할이 하나뿐이면 바로 로그인 시도
          const role = availableRoles[0];
          const loginResponse = await apiClient.post('/api/common/auth/login', {
            email: profile.email,
            role: role,
            loginType: 'NAVER' // 네이버 로그인임을 명시
          });
          authStore.setToken(loginResponse.data.accessToken);
          authStore.setRole(role); // 토큰 저장 및 역할 설정
          router.replace(role === 'TRAINER' ? '/trainer/mypage' : '/trainee/mypage');
        } else {
          // 역할 정보가 없는 경우 (예외 처리)
          alert('로그인에 실패했습니다: 역할 정보 없음');
          router.replace('/login');
        }
      }
    } catch (error) {
      console.error('네이버 콜백 처리 중 오류 발생:', error);
      alert('네이버 로그인 처리 중 오류가 발생했습니다.');
      router.replace('/login');
    }
  } else {
    alert('네이버 로그인에 필요한 정보가 부족합니다.');
    router.replace('/login');
  }
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <p class="text-white text-lg">네이버 로그인 처리 중...</p>
  </div>
</template>
