<script setup>
import TrainerGreeting from "@/components/trainer/mypage/TrainerGreeting.vue";
import TrainerInfo from "@/components/trainer/mypage/TrainerInfo.vue";
import TrainerMenu from "@/components/trainer/mypage/TrainerMenu.vue";
</script>

<template>
  <div class="min-h-screen pb-20 text-white">
    <!-- 트레이너 인사말 -->
    <TrainerGreeting></TrainerGreeting>
    <!-- 트레이너 정보 섹션 -->
    <TrainerInfo></TrainerInfo>
    <!-- 트레이너 사용 메뉴 -->
    <TrainerMenu></TrainerMenu>
  </div>
</template>
