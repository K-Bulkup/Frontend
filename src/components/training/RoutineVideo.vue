<script setup>
defineProps({
  videoUrl: String,
  thumbnail: String,
});

const emit = defineEmits(["play"]);

const handlePlayClick = () => {
  emit("play");
};
</script>

<template>
  <div class="my-6">
    <h3 class="mb-4 text-heading text-white">참고 영상</h3>
    <div
      @click="handlePlayClick"
      class="relative aspect-video cursor-pointer overflow-hidden rounded-xl bg-gray-200"
    >
      <!-- 썸네일이 있는 경우 -->
      <img
        v-if="thumbnail"
        :src="thumbnail"
        alt="비디오 썸네일"
        class="h-full w-full object-cover"
      />

      <!-- 썸네일이 없는 경우 -->
      <div v-else class="flex h-full w-full items-center justify-center">
        <img
          src="@/assets/images/trainee/training/youtube_white.svg"
          alt="유튜브 아이콘"
          class="h-12 w-12"
        />
      </div>
    </div>
  </div>
</template>
