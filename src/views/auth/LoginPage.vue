<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import apiClient from "@/plugins/axios";
import { useLogin } from "@/composables/user/useLogin";
import { useAuthStore } from "@/stores/auth";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseSelectRole from "@/components/common/BaseSelectRole.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import ConnectSuccessModal from "@/components/common/ActionStateModal.vue";
import ConnectFailureModal from "@/components/common/ConnectFailureModal.vue";

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
const selectedRole = ref(null);

const naverProfileData = ref(null);
const isNaverSignupFlow = ref(false);

const kakaoProfileData = ref(null);
const isKakaoSignupFlow = ref(false);

onMounted(() => {
  const { accessToken, role, isNewUser, email, providerId, name, loginType } =
    route.query;

  if (loginType && isNewUser === "true") {
    step.value = 2;
    form.value.email = email;
    form.value.loginType = loginType;

    naverProfileData.value = { providerId, name };
    kakaoProfileData.value = { providerId, name };

    isNaverSignupFlow.value = loginType === "NAVER";
    isKakaoSignupFlow.value = loginType === "KAKAO";
  } else if (accessToken && role) {
    authStore.setToken(accessToken);
    authStore.setRole(role);
    result.value = "success";
  }
});

const goNext = () => {
  if (
    form.value.email === "admin@admin.com" &&
    form.value.password === "admin"
  ) {
    router.push("/admin/login");
    return;
  }

  if (form.value.email && form.value.password) {
    form.value.loginType = "LOCAL";
    step.value++;
  }
};

const handleRoleSelection = (role) => {
  form.value.role = role;
  selectedRole.value = role;
};

const handleLogin = async () => {
  if (!form.value.role) {
    alert("역할을 선택해주세요.");
    return;
  }

  let success = false;

  if (isNaverSignupFlow.value || isKakaoSignupFlow.value) {
    try {
      const profileData = isNaverSignupFlow.value
        ? naverProfileData.value
        : kakaoProfileData.value;
      const loginType = isNaverSignupFlow.value ? "NAVER" : "KAKAO";

      const response = await apiClient.post(
        "/api/common/auth/social-signup-complete",
        {
          tempAccessToken: route.query.accessToken,
          role: form.value.role,
        },
      );
      authStore.setToken(response.data.accessToken);
      authStore.setRole(form.value.role);
      success = true;
    } catch (error) {
      console.error("소셜 회원가입 완료 중 오류 발생:", error);
      success = false;
    }
  } else {
    if (!form.value.loginType) {
      form.value.loginType = "LOCAL";
    }

    if (
      form.value.loginType === "LOCAL" &&
      (!form.value.email || !form.value.password)
    ) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const { success: loginSuccess } = await loginAndHandle(form.value);
    success = loginSuccess;
  }

  if (success) {
    if (authStore.role === "TRAINER") {
      router.push("/trainer/mypage/training");
    } else {
      router.push("/trainee/mypage");
    }
  } else {
    result.value = "fail";
  }
};

const handleNaverLogin = () => {
  window.location.href = "/api/common/auth/naver/start";
};

const handleKakaoLogin = () => {
  window.location.href = "/api/common/auth/kakao/start";
};
</script>

<template>
  <!-- 로그인 성공 화면 -->
  <div
    v-if="result === 'success'"
    class="flex min-h-screen flex-col justify-between px-1 py-20"
  >
    <ConnectSuccessModal />
    <div class="mt-10 flex w-full justify-center">
      <BaseButton
        @click="
          authStore.role === 'TRAINER'
            ? router.push('/trainer/mypage')
            : router.push('/trainee/mypage')
        "
      >
        홈으로 가기
      </BaseButton>
    </div>
  </div>

  <!-- 로그인 실패 화면 -->
  <div
    v-else-if="result === 'fail'"
    class="flex min-h-screen flex-col justify-between px-1 py-20"
  >
    <ConnectFailureModal
      @close="
        result = null;
        step = 1;
        router.push('login');
      "
    />
  </div>

  <!-- 로그인 입력 / 역할 선택 공용 래퍼 -->
  <div
    v-else
    class="relative flex min-h-screen flex-col px-4 py-12"
    :class="
      step === 2
        ? 'justify-start overflow-hidden overscroll-none pt-12'
        : 'justify-center py-12'
    "
  >
    <div class="relative z-10 mx-auto w-full max-w-md">
      <!-- 로그인 입력 화면 -->
      <div v-if="step === 1">
        <div class="flex justify-center">
          <img
            src="@/assets/images/kbulkup-logo.png"
            alt="K-Bulkup"
            class="h-30 mx-auto mb-2 w-auto"
          />
        </div>

        <form @submit.prevent="goNext" class="mx-auto mt-8 w-[332px]">
          <div class="space-y-3">
            <BaseInput v-model="form.email" placeholder="아이디" type="email" />
            <BaseInput
              v-model="form.password"
              placeholder="비밀번호"
              type="password"
            />
          </div>

          <BaseButton
            type="submit"
            class="mx-auto mt-6 block h-[50px] w-[332px]"
          >
            로그인
          </BaseButton>
        </form>

        <button
          @click="router.push('/signup')"
          class="w-full text-center text-sm text-white underline"
          style="margin-top: 3vh"
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
            class="h-12 w-12 cursor-pointer rounded-full"
            @click="handleNaverLogin"
          />
          <img
            src="@/assets/images/kakaoLogin.png"
            alt="카카오 로그인"
            class="h-12 w-12 cursor-pointer rounded-full"
            @click="handleKakaoLogin"
          />
        </div>
      </div>

      <!-- 역할 선택 화면 -->
      <div v-if="step === 2">
        <div class="flex justify-center">
          <img
            src="@/assets/images/kbulkup-logo.png"
            alt="K-Bulkup"
            class="h-30 mx-auto mt-10 w-auto"
          />
        </div>
        <div class="mx-auto w-[332px]">
          <BaseStatusMessage
            title="어떤 유형으로 로그인하시겠어요?"
            subtitle="트레이너 또는 트레이니 중 선택해주세요"
            variant="guide"
          />

          <div>
            <BaseSelectRole
              :selected="selectedRole"
              @select="handleRoleSelection"
            />
          </div>

          <div
            v-if="step === 2"
            class="fixed inset-x-0 bottom-16 z-20 flex justify-center"
          >
            <BaseButton
              @click="handleLogin"
              :isDisabled="!form.role"
              class="h-[50px] w-[332px] shadow-lg"
            >
              선택 완료
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
