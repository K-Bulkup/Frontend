<script setup>
import { computed } from "vue";
import star from "@/assets/images/star.svg";

const props = defineProps({
  training: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["click"]);

const formattedPrice = (price) => {
  return (price || 0).toLocaleString() + "원";
};

// 레벨 배지 (오른쪽 상단)
const levelBadge = computed(() => {
  const level = props.training.tags?.[1] || "초급";
  let backgroundColor;
  switch (level) {
    case "고급":
      backgroundColor = "#FF4141";
      break;
    case "중급":
      backgroundColor = "#5141FF";
      break;
    case "초급":
    default:
      backgroundColor = "#008407";
  }

  return { text: level, backgroundColor };
});

// 안전한 rating 처리
const safeRating = computed(() => {
  return (props.training.rating || 0).toFixed(1);
});
</script>

<template>
  <div
    @click="emit('click')"
    @keydown.enter="emit('click')"
    @keydown.space="emit('click')"
    role="button"
    tabindex="0"
    class="w-full max-w-[108px] cursor-pointer rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
  >
    <!-- 썸네일 이미지 영역 -->
    <div class="relative mb-2 h-[163px] w-[108px] overflow-hidden rounded-lg">
      <img
        :src="training.thumbnailUrl || '/placeholder-image.jpg'"
        :alt="`${training.title} 강의 썸네일`"
        class="h-full w-full object-cover"
        :style="{
          backgroundImage: !training.thumbnailUrl
            ? 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
            : 'none',
        }"
      />

      <!-- 왼쪽 상단 배지 -->
      <div class="absolute left-1 top-0.5">
        <span
          class="inline-block break-words rounded-xl bg-gray-900 px-2 py-1 text-center text-[7px] leading-tight text-white"
          style="width: 42px; word-break: keep-all"
        >
          {{ training.category }}
        </span>
      </div>

      <!-- 오른쪽 상단 배지 -->
      <div class="absolute right-1 top-0.5">
        <span
          v-if="levelBadge"
          class="rounded-xl px-1 py-1 text-[7px] text-white"
          :style="{
            backgroundColor: levelBadge.backgroundColor,
            width: '26px',
            height: '13px',
            fontSize: '7px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }"
        >
          {{ levelBadge.text }}
        </span>
      </div>
    </div>

    <!-- 제목과 별점 한 줄 -->
    <div class="mb-1 flex items-center justify-between">
      <!-- 제목 -->
      <div
        class="overflow-hidden text-ellipsis whitespace-nowrap leading-tight text-white"
        style="width: 77px; height: 13px; font-size: 11px"
        :title="training.title"
      >
        {{ training.title }}
      </div>

      <!-- 별점 -->
      <div class="flex items-center gap-0.5">
        <img :src="star" alt="별점 아이콘" class="h-2 w-2" />
        <span class="text-button text-white">{{ safeRating }}</span>
      </div>
    </div>

    <!-- 가격 -->
    <div class="text-button text-white">
      {{ formattedPrice(training.price) }}
    </div>
  </div>
</template>
