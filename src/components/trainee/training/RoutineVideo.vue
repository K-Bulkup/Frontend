<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  videoUrl: String,
  thumbnail: String,
  // 참고 영상 라벨 노출 여부 (기본: 숨김)
  showLabel: { type: Boolean, default: false },
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
    // URL 형식이 아닌 경우(예: 단순 videoId 문자열)
    if (typeof props.videoUrl === "string" && !props.videoUrl.includes("/")) {
      videoId = props.videoUrl;
    } else {
      console.error("URL 분석 실패:", e);
      return "";
    }
  }
  return videoId
    ? `https://www.youtube.com/embed/${videoId}?playsinline=1`
    : "";
});
</script>

<template>
  <div v-if="embedUrl" class="my-6">
    <!-- 참고 영상 라벨: 필요할 때만 노출 -->
    <p v-if="showLabel" class="mb-2 text-subtext text-gray-400">참고 영상</p>

    <div
      class="relative aspect-video overflow-hidden rounded-xl border border-gray-700 bg-realBlack"
    >
      <iframe
        :src="embedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="h-full w-full"
      />
    </div>
  </div>
</template>
