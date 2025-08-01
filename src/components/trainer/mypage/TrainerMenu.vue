<script setup>
import { useRouter } from "vue-router";

import certificationIcon from "@/assets/images/trainer/mypage/certificationIcon.svg";
import memberIcon from "@/assets/images/trainer/mypage/memberIcon.svg";
import qnaIcon from "@/assets/images/trainer/mypage/qnaIcon.svg";

const router = useRouter();

// 인증 페이지로 이동
const goToVerify = () => {
  router.push("/trainer/mypage/verify");
};
</script>
<template>
  <!-- 하단 메뉴 섹션 -->
  <div class="mx-5 mt-6 grid grid-cols-3 gap-4">
    <!-- 수강생관리 -->
    <div class="flex flex-col items-center">
      <div
        class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-white"
      >
        <img :src="memberIcon" alt="인증" class="h-6 w-6" />
        <i class="fas fa-users text-xl"></i>
      </div>
      <span class="text-sm text-white">수강생관리</span>
    </div>

    <!-- 인증 -->
    <div class="flex cursor-pointer flex-col items-center" @click="goToVerify">
      <div
        class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-black"
      >
        <img :src="certificationIcon" alt="인증" class="h-8 w-8" />
        <i class="fas fa-check text-xl"></i>
      </div>
      <span class="text-sm text-white">인증</span>
    </div>

    <!-- QNA -->
    <div class="flex flex-col items-center">
      <div
        class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-white"
      >
        <img :src="qnaIcon" alt="인증" class="h-6 w-6" />
        <i class="fas fa-comments text-xl"></i>
      </div>
      <span class="text-sm text-white">QNA</span>
    </div>
  </div>
</template>
