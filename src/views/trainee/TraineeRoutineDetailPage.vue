<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import RoutineSubmitBar from "@/components/training/RoutineSubmitBar.vue";
import RoutineChat from "@/components/training/RoutineChat.vue";
import RoutineVideo from "@/components/training/RoutineVideo.vue";

const router = useRouter();

// 예시 데이터
const RoutineData = ref({
  id: 1,
  title: "계좌 개설하기",
  description:
    "위 영상을 참고하여 과제를 수행하고 결과를 입력해주세요. 사진을 첨부하거나 텍스트로 답변할 수 있습니다.",
  level: "초급",
  category: "투자입문",
  reward: 2,
  videoUrl: "https://www.youtube.com/watch?v=c2v2NyDQhnw",
});
const currentRoutine = ref(RoutineData.value);
const certificationPhotos = ref([
  {
    id: 1,
    description: "계좌 개설 완료",
    imageUrl: null,
    timestamp: new Date(),
  },
]);

const handleGoBack = () => router.back();
const openVideo = () => {
  if (currentRoutine.value?.videoUrl) {
    window.open(currentRoutine.value.videoUrl, "_blank");
  }
};

const handleCertificationSubmit = (newCertification) => {
  certificationPhotos.value.push(newCertification);
};
</script>

<template>
  <div class="flex h-screen flex-col bg-realBlack">
    <header class="flex-shrink-0 px-6 pt-10">
      <BaseHeader title="루틴 상세" @back="handleGoBack" />
    </header>

    <main class="flex-1 overflow-y-auto px-6 pb-40 pt-4 scrollbar-hide">
      <div class="mt-4 flex items-center gap-2">
        <BaseBadge>{{ currentRoutine.level }}</BaseBadge>
        <BaseBadge>{{ currentRoutine.category }}</BaseBadge>
        <BaseBadge variant="primary" class="ml-auto">
          리워드 {{ currentRoutine.reward }}P
        </BaseBadge>
      </div>
      <RoutineVideo
        :video-url="currentRoutine.videoUrl"
        :thumbnail="videoThumbnail"
        @play="openVideo"
      />
      <h3 class="mb-4 text-heading text-white">현재 루틴</h3>
      <div class="mb-6 rounded-xl bg-gray-100 p-4">
        <h3 class="mb-2 text-body font-bold text-black">
          {{ currentRoutine.title }}
        </h3>
        <p class="text-subtext leading-relaxed text-gray-700">
          {{ currentRoutine.description }}
        </p>
      </div>
      <div class="flex flex-col items-end space-y-3">
        <RoutineChat
          v-for="photo in certificationPhotos"
          :key="photo.id"
          :photo="photo"
        />
      </div>
    </main>

    <RoutineSubmitBar @submit="handleCertificationSubmit" />
  </div>
</template>
