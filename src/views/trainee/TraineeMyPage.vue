<script setup>
import { onMounted, ref } from "vue";

import LevelDisplay from "@/components/trainee/mypage/LevelDisplay.vue";
import GrowthCard from "@/components/trainee/mypage/GrowthCard.vue";
import logoBlack from "@/assets/images/mascot/logo_black.png";
import { getTraineeProfile } from "@/composables/api/trainee/mypage/traineeTrainingApi";

const userName = ref("");
const growthScore = ref(0);

onMounted(async () => {
  try {
    const profile = await getTraineeProfile();
    userName.value = profile.username;
    growthScore.value = profile.growthScore;
  } catch (error) {
    console.error("프로필 정보 불러오기 실패:", error);
  }
});
</script>

<template>
  <LevelDisplay :growth-score="growthScore">
    <div class="flex h-screen flex-col p-6 pb-20">
      <img :src="logoBlack" alt="블랙 로고" class="h-20 w-20" />

      <div class="flex-grow"></div>

      <GrowthCard :growth-score="growthScore" class="mb-6" />
    </div>
  </LevelDisplay>
</template>
