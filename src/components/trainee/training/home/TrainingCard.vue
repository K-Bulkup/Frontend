<!-- src/components/trainee/training/home/TrainingCard.vue -->
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

const formattedPrice = (price) => (price || 0).toLocaleString() + "원";

/** 레벨 표준화: 숫자/영문/대소문자 모두 처리 */
const normalizeLevel = (val) => {
  if (val == null) return null;
  const s = String(val).trim();
  if (!s) return null;

  const LUT = {
    초급: "초급",
    중급: "중급",
    고급: "고급",
    BEGINNER: "초급",
    INTERMEDIATE: "중급",
    ADVANCED: "고급",
    LOW: "초급",
    MID: "중급",
    HIGH: "고급",
    1: "초급",
    2: "중급",
    3: "고급",
  };
  const key = s.toUpperCase?.() ?? s;
  return LUT[key] ?? s; // 모르는 값이면 원문 유지
};

// 레벨 배지 (오른쪽 상단)
const levelBadge = computed(() => {
  // ✅ level 우선, 없으면 tags[1] 사용
  const raw = props.training.level ?? props.training.tags?.[1] ?? null;
  const level = normalizeLevel(raw) ?? "초급";

  const backgroundColor =
    level === "고급" ? "#FF4141" : level === "중급" ? "#5141FF" : "#008407";

  return { text: level, backgroundColor };
});

// 안전한 rating 처리
const safeRating = computed(() =>
  Number(props.training.rating || 0).toFixed(1),
);
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
    <!-- 썸네일 -->
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

      <!-- 왼쪽 상단: 카테고리 -->
      <div class="absolute left-1 top-0.5">
        <span
          class="inline-block break-words rounded-xl bg-gray-900 px-2 py-1 text-center text-[7px] leading-tight text-white"
          style="width: 42px; word-break: keep-all"
        >
          {{ training.category }}
        </span>
      </div>

      <!-- 오른쪽 상단: 레벨 -->
      <div class="absolute right-1 top-0.5">
        <span
          class="inline-block break-words rounded-xl px-2 py-1 text-center text-[7px] leading-tight text-white"
          :style="{ backgroundColor: levelBadge.backgroundColor }"
        >
          {{ levelBadge.text }}
        </span>
      </div>
    </div>

    <!-- 제목 & 별점 -->
    <div class="mb-1 flex items-center justify-between">
      <div
        class="overflow-hidden text-ellipsis whitespace-nowrap leading-tight text-white"
        style="width: 77px; height: 13px; font-size: 11px"
        :title="training.title"
      >
        {{ training.title }}
      </div>

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
