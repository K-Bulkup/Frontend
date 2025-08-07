<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/plugins/axios";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import ConnectSuccessModal from "@/components/common/ConnectSuccessModal.vue";
import ConnectFailureModal from "@/components/common/ConnectFailureModal.vue";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: "",
  password: "",
});

const step = ref(1); // 1: 로그인 페이지, 2: 성공, 3: 실패

const isEmailValid = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    return;
  }
  if (!isEmailValid(form.value.email)) {
    return;
  }

  try {
    const response = await apiClient.post("/api/admin/auth/login", {
      email: form.value.email,
      password: form.value.password,
      role: "ADMIN",
      loginType: "LOCAL",
    });

    const { accessToken } = response.data;

    if (accessToken) {
      authStore.setToken(accessToken);
      authStore.setRole("ADMIN");

      step.value = 2;
      router.push("/admin/dashboard");
    } else {
      step.value = 3;
    }
  } catch (error) {
    console.error("관리자 로그인 중 오류 발생:", error);
    step.value = 3;
  }
};
</script>

<template>
  <div
    v-if="step === 2"
    class="flex min-h-screen flex-col justify-between px-1 py-20"
  >
    <ConnectSuccessModal />
    <div class="mt-10 flex w-full justify-center">
      <BaseButton @click="router.push('/admin/dashboard')"
        >대시보드로 가기</BaseButton
      >
    </div>
  </div>

  <div
    v-else-if="step === 3"
    class="flex min-h-screen flex-col justify-between px-1 py-20"
  >
    <ConnectFailureModal @retry="step = 1" />
  </div>

  <div v-else class="flex min-h-screen flex-col justify-center px-4 py-12">
    <div class="mx-auto w-full max-w-md">
      <h2 class="text-center text-4xl font-extrabold text-white">K-Bulkup</h2>
      <h2 class="text-center text-2xl font-extrabold text-white">ADMIN</h2>
      <form
        @submit.prevent="handleLogin"
        class="mt-8 space-y-6"
        autocomplete="off"
      >
        <BaseInput
          v-model="form.email"
          placeholder="아이디"
          type="text"
          :is-invalid="form.email !== '' && !isEmailValid(form.email)"
          autocomplete="username"
        />
        <BaseInput
          v-model="form.password"
          placeholder="비밀번호"
          type="password"
          class="rounded-full"
          autocomplete="current-password"
        />
        <BaseButton
          type="submit"
          class="w-full border-white bg-[#2D2D40] py-3 text-white"
        >
          로그인
        </BaseButton>
      </form>
    </div>
  </div>
</template>
