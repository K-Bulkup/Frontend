<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const handleProfileClick = () => {
  router.push("/trainer/mypage");
};
</script>

<template>
  <div class="relative h-[101px] w-[393px]">
    <!-- 로고 이미지 -->
    <div class="absolute top-[14px]">
      <img
        src="@/assets/images/mascot/logo.png"
        alt="로고"
        class="h-[87px] w-[87px]"
      />
    </div>

    <!-- 사용자 프로필 이미지 -->
    <div class="absolute right-[35px] top-[33px]">
      <button
        @click="handleProfileClick"
        class="h-[45px] w-[45px] rounded-full transition-transform hover:scale-105"
      >
        <img src="@/assets/images/trainer/mypage/profile.png" alt="프로필" />
      </button>
    </div>
  </div>
</template>
