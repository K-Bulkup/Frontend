<script setup>
import { onMounted, ref } from "vue";
import ProfileCard from "@/components/trainee/mypage/ProfileCard.vue";
import CourseList from "@/components/trainee/mypage/CourseList.vue";
import BaseHeaderWithoutBack from "@/components/common/BaseHeaderWithoutBack.vue";
import { getTraineeTraining } from "@/composables/api/trainee/mypage/traineeTrainingApi";
import { getTraineeProfile } from "@/composables/api/trainee/mypage/traineeTrainingApi";

const courses = ref([]);
const userName = ref("");
const growthScore = ref(0);

onMounted(async () => {
  try {
    const trainingResponse = await getTraineeTraining();
    courses.value = trainingResponse.map((item) => ({
      id: item.trainingId,
      title: item.title,
      progress: item.progress,
      thumbnailUrl: item.thumbnailUrl,
    }));

    const profile = await getTraineeProfile();
    userName.value = profile.username;
    growthScore.value = profile.growthScore;
  } catch (error) {
    console.error("수강 목록 불러오기 실패:", error);
  }
});
</script>

<template>
  <div class="p-6">
    <BaseHeaderWithoutBack title="마이 페이지" />
    <ProfileCard :userName="`${userName}님은`" :growthScore="growthScore" />
    <CourseList :courses="courses" class="mt-6" />
  </div>
</template>
