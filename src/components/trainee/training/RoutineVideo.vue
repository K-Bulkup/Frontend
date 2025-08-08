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
    // 표준 YouTube URL (watch?v=...)
    videoId = url.searchParams.get("v");
    // 짧은 YouTube URL (youtu.be/...)
    if (!videoId) {
      videoId = url.pathname.substring(1);
    }
  } catch (e) {
    // URL 형식이 아닌 경우(예: 단순 videoId 문자열)를 대비한 처리
    if (typeof props.videoUrl === "string" && !props.videoUrl.includes("/")) {
      videoId = props.videoUrl;
    } else {
      console.error("URL 분석 실패:", e);
      return "";
    }
  }
  if (videoId) {
    // YouTube 임베드 URL에 인라인 재생 옵션 추가
    return `https://www.youtube.com/embed/${videoId}?playsinline=1`;
  }
  return "";
});
</script>

<template>
  <div v-if="embedUrl" class="my-6">
    <h3 class="mb-4 text-heading text-white">참고 영상</h3>
    <div
      class="relative aspect-video overflow-hidden rounded-xl border border-gray-700 bg-realBlack"
    >
      <iframe
        :src="embedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="h-full w-full"
      ></iframe>
    </div>
  </div>
</template>
