<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useLogin } from "@/composables/user/useLogin";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";

const router = useRouter();
const { loginAndHandle } = useLogin();
const step = ref(1);

const form = ref({
  email: "",
  password: "",
  logintype: "",
  role: "",
});

const result = ref(null);
const selectedRole = ref(null); // 새로 추가: 선택된 역할을 저장

const goNext = () => {
  if (form.value.email && form.value.password) {
    form.value.logintype = "LOCAL";
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
  const { success } = await loginAndHandle(form.value);

  if (success) {
    result.value = "success";
    // 리디렉션은 useAuthStore에서 처리하므로 여기서는 별도 처리하지 않음
  } else {
    result.value = "fail";
  }
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
      <BaseButton @click="router.push('/login')">홈으로 가기</BaseButton>
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
            class="h-12 w-12 rounded-full"
          />
          <img
            src="@/assets/images/kakaoLogin.png"
            alt="카카오 로그인"
            class="h-12 w-12 rounded-full"
          />
        </div>
      </div>

      <!-- 역할 선택 화면 -->
      <div v-if="step === 2">
        <p class="mt-2 text-center text-lg font-semibold text-white">
          어떤 유형으로 가입하시겠어요?
        </p>
        <div class="mt-8 space-y-4">
          <!-- 트레이너 카드 -->
          <div
            @click="handleRoleSelection('trainer')"
            :class="{ 'border-4 border-yellow-500': selectedRole === 'trainer' }"
            class="flex cursor-pointer items-center justify-between rounded-xl bg-white px-4 py-4 shadow"
          >
            <div>
              <p class="font-bold text-black">트레이너</p>
              <p class="text-sm text-gray-500">회원을 찾고 있어요.</p>
            </div>
            <img
              src="@/assets/images/trainer-icon.png"
              alt="트레이너 아이콘"
              class="h-12 w-12"
            />
          </div>

          <!-- 회원 카드 -->
          <div
            @click="handleRoleSelection('trainee')"
            :class="{ 'border-4 border-yellow-500': selectedRole === 'trainee' }"
            class="flex cursor-pointer items-center justify-between rounded-xl bg-white px-4 py-4 shadow"
          >
            <div>
              <p class="font-bold text-black">회원</p>
              <p class="text-sm text-gray-500">트레이너를 찾고 있어요.</p>
            </div>
            <img
              src="@/assets/images/trainee-icon.png"
              alt="회원 아이콘"
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
