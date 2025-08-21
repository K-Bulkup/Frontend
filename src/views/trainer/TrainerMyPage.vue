<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import TrainerInfo from "@/components/trainer/mypage/TrainerInfo.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";

const router = useRouter();
const authStore = useAuthStore();

// 툴팁에 표시할 자격증 목록
const certificateList = computed(() => {
  return trainerData.certificates.join(", ");
});

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

const handleAddCertification = () => {
  router.push("/trainer/mypage/verify");
};

const handleBack = () => {
  router.go(-1); // 이전 페이지로
};
</script>

<template>
  <div class="pb-20">
    <div class="">
      <BaseHeader @back="handleBack">
        <template #actions>
          <button
            @click="handleAddCertification"
            class="items-center rounded-full bg-gray-900 px-3 py-1.5 text-body2 text-white transition-all hover:bg-gray-700"
          >
            <span class="pr-2 font-bold text-green-400">+</span>
            <span>자격 인증</span>
          </button></template
        ></BaseHeader
      >
    </div>
    <div>
      <TrainerInfo></TrainerInfo>
    </div>
    <div class="pt-5 text-center text-gray-600">
      <button @click="handleLogout">로그아웃</button>
    </div>
  </div>
</template>
