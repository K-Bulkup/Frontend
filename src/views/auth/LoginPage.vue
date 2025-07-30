<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import apiClient from "@/plugins/axios";
import { useLogin } from "@/composables/user/useLogin";
import { useAuthStore } from "@/stores/auth";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { loginAndHandle } = useLogin();
const step = ref(1);

const form = ref({
  email: "",
  password: "",
  loginType: "",
  role: "",
});

const result = ref(null);
const selectedRole = ref(null); // 새로 추가: 선택된 역할을 저장

const naverProfileData = ref(null); // 네이버 프로필 데이터 저장
const isNaverSignupFlow = ref(false); // 네이버 신규 가입 흐름인지 여부

const kakaoProfileData = ref(null); // 카카오 프로필 데이터 저장
const isKakaoSignupFlow = ref(false); // 카카오 신규 가입 흐름인지 여부

onMounted(() => {
  console.log('LoginPage received query:', route.query); // 디버깅을 위한 로그 추가
  console.log('Current step on mount:', step.value); // 현재 step 값 로깅 추가

  const { accessToken, role, isNewUser, email, providerId, name, loginType } = route.query;

  // Case 1: Social login redirect that requires role selection (HIGHEST PRIORITY)
  if (loginType && isNewUser === 'true') {
    step.value = 2; // Move to role selection
    form.value.email = email; // Pre-fill email if available
    form.value.loginType = loginType; // Set loginType

    // Store profile data for social signup/login completion
    naverProfileData.value = { providerId, name }; // 네이버 프로필 데이터 저장 (재활용)
    kakaoProfileData.value = { providerId, name }; // 카카오 프로필 데이터 저장 (재활용)

    // Set flags for social signup flow
    isNaverSignupFlow.value = (loginType === 'NAVER');
    isKakaoSignupFlow.value = (loginType === 'KAKAO');
  } else if (accessToken && role) {
    // Case 2: Fully logged in (accessToken and role present, and isNewUser is not 'true')
    authStore.setToken(accessToken);
    authStore.setRole(role);
    result.value = "success"; // 로그인 성공 화면 표시
  }
  // If neither of the above, step remains 1 (local login screen)
});


const goNext = () => {
  if (form.value.email && form.value.password) {
    form.value.loginType = "LOCAL";
    step.value++;
  }
};

// 역할 카드 클릭 시 호출될 함수
const handleRoleSelection = (role) => {
  form.value.role = role;
  selectedRole.value = role; // 선택된 역할 업데이트
};

// "다음" 버튼 클릭 시 호출될 로그인 함수
const handleLogin = async () => {
  if (!form.value.role) {
    // 역할이 선택되지 않았다면 경고 또는 처리
    alert("역할을 선택해주세요.");
    return;
  }

  let success = false;

  if (isNaverSignupFlow.value || isKakaoSignupFlow.value) {
    console.log("Sending social signup complete request with form data:", form.value); // 로그 추가
    // 네이버/카카오 신규 가입 흐름인 경우 social-signup-complete API 호출
    try {
      const profileData = isNaverSignupFlow.value ? naverProfileData.value : kakaoProfileData.value;
      const loginType = isNaverSignupFlow.value ? "NAVER" : "KAKAO";

      const response = await apiClient.post('/api/common/auth/social-signup-complete', {
        tempAccessToken: route.query.accessToken, // 백엔드에서 받은 accessToken을 tempAccessToken으로 사용
        role: form.value.role // 사용자가 선택한 역할
      });
      authStore.setToken(response.data.accessToken);
      authStore.setRole(form.value.role);
      success = true;
    } catch (error) {
      console.error('소셜 회원가입 완료 중 오류 발생:', error);
      alert('회원가입 중 오류가 발생했습니다.');
      success = false;
    }
  } else {
    console.log("Sending local login request with form data:", form.value); // 로그 추가
    // 일반 로컬 로그인 흐름인 경우 로그인 API 호출
    if (!form.value.loginType) {
      form.value.loginType = "LOCAL"; // loginType이 설정되지 않은 경우 LOCAL로 명시
    }

    // 로컬 로그인 시 이메일과 비밀번호 유효성 검사 추가
    if (form.value.loginType === "LOCAL" && (!form.value.email || !form.value.password)) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return; // 로그인 시도 중단
    }

    const { success: loginSuccess } = await loginAndHandle(form.value);
    success = loginSuccess;
  }

  if (success) {
    result.value = "success";
    console.log('Redirecting with authStore.role:', authStore.role); // 추가된 로그
    // 리디렉션은 useAuthStore에서 처리하므로 여기서는 별도 처리하지 않음
  } else {
    result.value = "fail";
  }
};

const handleNaverLogin = () => {
  console.log("네이버 로그인 시작: 백엔드 엔드포인트로 리다이렉트");
  window.location.href = "/api/common/auth/naver/start"; // 정확한 경로로 변경
};

const handleKakaoLogin = () => {
  console.log("카카오 로그인 시작: 백엔드 엔드포인트로 리다이렉트");
  window.location.href = "/api/common/auth/kakao/start"; // 정확한 경로로 변경
};
</script>

<template>
  <!-- 로그인 성공 화면 -->
  <div
    v-if="result === 'success'"
    class="flex min-h-screen flex-col justify-between px-1 py-20"
  >
    <BaseStatusMessage
      icon="✅"
      title="로그인이 완료되었습니다"
      subtitle="K-Bulkup과 함께 건강한 습관을 시작해보세요"
      variant="status"
    />
    <div class="mt-10 flex w-full justify-center">
      <BaseButton @click="authStore.role === 'TRAINER' ? router.push('/trainer/mypage') : router.push('/trainee/mypage')">홈으로 가기</BaseButton>
    </div>
  </div>

  <!-- 로그인 실패 화면 -->
  <div
    v-else-if="result === 'fail'"
    class="flex min-h-screen flex-col justify-between px-1 py-20"
  >
    <BaseStatusMessage
      icon="⚠️"
      title="로그인에 실패했습니다"
      subtitle="입력한 정보를 다시 한 번 확인해주세요"
      variant="status"
    />
    <div class="mt-10 flex w-full justify-center">
      <BaseButton @click="result = null; step = 1;">다시 시도</BaseButton>
    </div>
  </div>

  <!-- 로그인 입력 화면 -->
  <div v-else class="flex min-h-screen flex-col justify-center px-4 py-12">
    <div class="mx-auto w-full max-w-md">
      <div v-if="step === 1">
        <h2 class="text-center text-4xl font-extrabold text-white">K-Bulkup</h2>
        <div class="mt-8 space-y-6">
          <BaseInput v-model="form.email" placeholder="아이디" type="email" />
          <BaseInput
            v-model="form.password"
            placeholder="비밀번호"
            type="password"
            class="rounded-full"
          />
          <BaseButton
            @click="goNext"
            class="w-full border-white bg-[#2D2D40] py-3 text-white"
          >
            로그인
          </BaseButton>
        </div>
        <button
          @click="router.push('/signup')"
          class="w-full text-center text-sm text-white underline"
          style="margin-top: 5vh"
        >
          회원가입
        </button>
        <p class="text-center text-sm text-white" style="margin-top: 10vh">
          SNS 계정으로 로그인하기
        </p>
        <div class="mt-4 flex justify-center space-x-4">
          <img
            src="@/assets/images/naverLogin.png"
            alt="네이버 로그인"
            class="h-12 w-12 rounded-full cursor-pointer"
            @click="handleNaverLogin"
          />
          <img
            src="@/assets/images/kakaoLogin.png"
            alt="카카오 로그인"
            class="h-12 w-12 rounded-full cursor-pointer"
            @click="handleKakaoLogin"
          />
        </div>
      </div>

      <!-- 역할 선택 화면 -->
      <div v-if="step === 2">
        <p class="mt-2 text-center text-lg font-semibold text-white">
          어떤 유형으로 가입하시겠어요?
        </p>
        <div class="mt-8 space-y-4">
          <!-- 역할 카드 -->
          <div
            v-for="role in ['TRAINER', 'TRAINEE']"
            :key="role"
            @click="handleRoleSelection(role)"
            :class="{ 'border-4 border-yellow-500': selectedRole === role }"
            class="flex cursor-pointer items-center justify-between rounded-xl bg-white px-4 py-4 shadow"
          >
            <div>
              <p class="font-bold text-black">{{ role === 'TRAINER' ? '트레이너' : '회원' }}</p>
              <p class="text-sm text-gray-500">{{ role === 'TRAINER' ? '회원을 찾고 있어요.' : '트레이너를 찾고 있어요.' }}</p>
            </div>
            <img
              :src="role === 'TRAINER' ? '/src/assets/images/trainer-icon.png' : '/src/assets/images/trainee-icon.png'"
              :alt="role === 'TRAINER' ? '트레이너 아이콘' : '회원 아이콘'"
              class="h-12 w-12"
            />
          </div>
        </div>

        <div class="mt-10">
          <BaseButton @click="handleLogin" class="w-full bg-[#2D2D40] py-3 text-white"
            >다음</BaseButton
          >
        </div>
      </div>
    </div>
  </div>
</template>
