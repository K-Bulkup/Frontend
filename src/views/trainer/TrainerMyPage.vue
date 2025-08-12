<script setup>
import { useRouter } from "vue-router";
import TrainerInfo from "@/components/trainer/mypage/TrainerInfo.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";

const router = useRouter();

const handleAddCertification = () => {
  router.push("/trainer/mypage/verify");
};

const handleBack = () => {
  router.go(-1); // 이전 페이지로
};
</script>

<template>
  <div class="min-h-screen pb-20 text-white">
    <div class="">
      <BaseHeader @back="handleBack">
        <template #actions>
          <button
            @click="handleAddCertification"
            class="text-body2 items-center rounded-full bg-gray-900 px-3 py-1.5 text-white transition-all hover:bg-gray-700"
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
  </div>
</template>
