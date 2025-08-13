<script setup>
import { computed } from "vue";

import BaseTag from "../common/BaseTag.vue";

import star from "@/assets/images/star.svg";
import nodata from "@/assets/images/mascot/nodata.png";

// Props 정의
const props = defineProps({
  trainingData: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        value && typeof value === "object" && value.title && value.description
      );
    },
  },
  userRole: {
    type: String,
    required: true,
    validator: (value) => ["trainer", "trainee"].includes(value),
  },
});

// 레벨 배지 (오른쪽 상단)
const levelBadge = computed(() => {
  const level = props.trainingData.level || "초급";
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
</script>

<template>
  <div>
    <!-- 고정된 썸네일과 제목 영역 - 두 개의 분리된 박스 -->
    <div class="top-0">
      <div class="flex pr-4 pt-3">
        <!-- 썸네일 박스 (고정) -->
        <div class="flex-shrink-0 overflow-hidden rounded-2xl px-3 py-4">
          <div class="h-[163px] w-[108px] overflow-hidden rounded-xl">
            <img
              :src="trainingData.thumbnailUrl || nodata"
              :alt="`${trainingData.title} 강의 썸네일`"
              class="h-full w-full"
              :class="
                trainingData.thumbnailUrl ? 'object-cover' : 'object-contain'
              "
              @error="$event.target.src = nodata"
            />
          </div>
        </div>

        <!-- 내용 박스 (고정) -->
        <div class="flex-1 rounded-2xl pt-7 text-white">
          <!-- 제목 -->
          <div
            class="mb-4 line-clamp-3 overflow-hidden text-subTitle font-bold leading-tight"
            style="display: -webkit-box; -webkit-box-orient: vertical"
          >
            {{ trainingData.title }}
          </div>

          <!-- 수강생 수와 별점 -->
          <div class="mb-4 flex items-center gap-3 text-body text-gray-300">
            <span class="flex items-center gap-1">
              수강생 {{ trainingData.studentCount?.toLocaleString() || "0" }}
            </span>
            <span class="flex items-center gap-1">
              <img :src="star" alt="별점" class="h-4 w-4" />
              {{ trainingData.trainerRating || "4.8" }}
            </span>
          </div>

          <!-- 태그 영역 -->
          <div class="flex gap-1">
            <!-- 초급 태그 (초록색) -->
            <BaseTag
              v-if="levelBadge"
              :text="levelBadge.text"
              class="inline-block break-words rounded-xl bg-gray-900 px-2 py-1 text-center text-[7px] leading-tight text-white"
              :style="{
                backgroundColor: levelBadge.backgroundColor,
              }"
            />

            <!-- 기타 태그들 (회색) -->
            <BaseTag
              :text="trainingData.category || '신용과 부채 관리'"
              class="rounded-full bg-gray-600 px-3 py-1.5 text-sm font-medium text-white"
            />

            <BaseTag
              :text="'0P'"
              class="rounded-full bg-gray-600 px-3 py-1.5 text-sm font-medium text-white"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 트레이너 정보 (트레이니에게만 표시) -->
    <div
      v-if="userRole === 'trainee' && trainingData.trainerName"
      class="mb-6 flex items-center gap-3 text-gray-300"
    >
      <img
        :src="trainingData.trainerProfileUrl"
        :alt="trainingData.trainerName"
        class="h-8 w-8 rounded-full object-cover"
      />
      <span>{{ trainingData.trainerName }}</span>
    </div>
  </div>
</template>
