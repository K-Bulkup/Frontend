import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { postLogin } from '@/composables/api/useUserApi' // 로그인 API 함수
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // 1. State (상태)
  const token = ref(null)
  const user = ref(null)

  // 2. Getters (계산된 값)
  const isAuthenticated = computed(() => !!token.value)

  // 3. Actions (메서드)
  async function login(credentials) {
    try {
      const res = await postLogin(credentials) // API 호출
      // 성공 시 토큰과 사용자 정보 저장
      token.value = res.data.accessToken
      user.value = {
        userId: res.data.userId,
        nickname: res.data.nickname,
        roles: res.data.roles // roles는 배열 형태
      }

      // 로그인 성공 후, 역할에 따라 적절한 페이지로 이동
      let destination = '/'; // 기본 경로
      if (user.value.roles && user.value.roles.includes('TRAINER')) {
        destination = '/trainer/mypage';
      } else if (user.value.roles && user.value.roles.includes('TRAINEE')) { // 'USER' 역할은 'trainee'로 간주
        destination = '/trainee/mypage';
      }
      router.push(destination);

      return { success: true }
    } catch (error) {
      console.error('Login failed in store:', error)
      return { success: false, error }
    }
  }

  function logout() {
    // 상태 초기화
    token.value = null
    user.value = null
    // 로그인 페이지로 리디렉션
    router.push('/login')
  }

  return { token, user, isAuthenticated, login, logout }
}, {
  persist: true, // 4. 이 스토어의 상태를 영구 저장하도록 설정
})
