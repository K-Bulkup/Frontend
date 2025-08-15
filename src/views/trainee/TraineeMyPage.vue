<script setup>
import { onMounted, ref } from "vue";

import LevelDisplay from "@/components/trainee/mypage/LevelDisplay.vue";
import GrowthCard from "@/components/trainee/mypage/GrowthCard.vue";
import { getTraineeProfile } from "@/composables/api/trainee/mypage/traineeTrainingApi";
import CollectionCard from "@/components/trainee/mypage/CollectionCard.vue";

const userName = ref("");
const growthScore = ref(0);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const profile = await getTraineeProfile();
    userName.value = profile.username;
    growthScore.value = profile.growthScore;
  } catch (error) {
    console.error("프로필 정보 불러오기 실패:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div
    :class="[
      'transition-opacity duration-500 ease-in-out',
      isLoading ? 'opacity-0' : 'opacity-100',
    ]"
  >
    <LevelDisplay :growth-score="growthScore" :apply-backdrop-blur="true">
      <CollectionCard :growth-score="growthScore" :user-name="userName" />
      <GrowthCard :growth-score="growthScore" />
    </LevelDisplay>
  </div>
</template>
