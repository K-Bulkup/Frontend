<script setup>
import { ref } from "vue";
import ProfileCard from "@/components/trainee/mypage/ProfileCard.vue";
import CourseList from "@/components/trainee/mypage/CourseList.vue";
import BaseHeaderWithoutBack from "@/components/common/BaseHeaderWithoutBack.vue";

const courses = ref([
  {
    id: 1,
    title: "강좌이름1강좌이름1",
    progress: 75,
  },
  {
    id: 2,
    title: "강좌이름2강좌이름2",
    progress: 75,
  },
  {
    id: 3,
    title: "강좌이름3강좌이름3",
    progress: 75,
  },
  {
    id: 4,
    title: "강좌이름4강좌이름4",
    progress: 50,
  },
  {
    id: 5,
    title: "강좌이름5강좌이름5",
    progress: 50,
  },
]);
</script>

<template>
  <div class="p-6">
    <BaseHeaderWithoutBack title="마이 페이지" />
    <ProfileCard :userName="'홍길동님은'" :stats="'3대 200Kg'" />
    <CourseList :courses="courses" class="mt-6" />
  </div>
</template>
