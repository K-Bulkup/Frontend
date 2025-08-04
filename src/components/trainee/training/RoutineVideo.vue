<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  videoUrl: String,
  thumbnail: String,
});

const embedUrl = computed(() => {
  if (!props.videoUrl) return "";
  let videoId = null;
  try {
    const url = new URL(props.videoUrl);
    videoId = url.searchParams.get("v");
    if (!videoId) {
      videoId = url.pathname.substring(1);
    }
  } catch (e) {
    console.error("URL 분석 실패:", e);
    return "";
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?playsinline=1`;
  }
  return "";
});
</script>

<template>
  <div class="my-6">
    <h3 class="mb-4 text-heading text-white">참고 영상</h3>
    <div
      class="relative aspect-video overflow-hidden rounded-xl border border-gray-700 bg-realBlack"
    >
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="h-full w-full"
      ></iframe>

      <div
        v-else
        class="flex h-full w-full flex-col items-center justify-center gap-2"
      >
        <img
          src="@/assets/images/trainee/training/youtube_white.svg"
          alt="유튜브 아이콘"
          class="h-10 w-10 opacity-50"
        />
        <p class="text-caption text-gray-400">영상을 불러올 수 없습니다.</p>
      </div>
    </div>
  </div>
</template>
