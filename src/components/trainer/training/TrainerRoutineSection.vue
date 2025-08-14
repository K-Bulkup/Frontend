<script setup>
import { computed } from "vue";
import BaseTag from "@/components/common/BaseTag.vue";
import CategoryIconBox from "@/components/common/CategoryIconBox.vue";

import stretchingIcon from "@/assets/images/mascot/routine/Geumyuk_stretching.png";
import strengthIcon from "@/assets/images/mascot/routine/Geumyuk_strength.png";
import cardioIcon from "@/assets/images/mascot/routine/Geumyuk_cardio.png";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "루틴을 입력해주세요",
  },
  routines: {
    type: Array,
    default: () => [],
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle", "edit-routine"]);

const iconSrc = computed(() => {
  switch (props.title) {
    case "스트레칭":
      return stretchingIcon;
    case "근력":
      return strengthIcon;
    case "유산소":
      return cardioIcon;
    default:
      return "";
  }
});

const convertQuizTypeToLabel = (type) => {
  switch (type) {
    case "PHOTO":
      return "실천형";
    case "SHORT_ANSWER":
      return "주관식";
    case "OX":
      return "OX";
    default:
      return "";
  }
};
</script>

<template>
  <div :class="isExpanded ? 'mb-8' : 'mb-1'">
    <div
      @click="emit('toggle')"
      class="flex cursor-pointer items-center justify-between px-4 py-1"
    >
      <div class="flex items-center gap-3">
        <CategoryIconBox :icon-src="iconSrc" :alt-text="title" />

        <div class="flex flex-col pl-2">
          <span class="text-body text-gray-50">{{ title }}</span>
          <span class="text-body3 text-gray-50">{{ subtitle }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <img
          src="@/assets/images/Chevron_Down_XL.svg"
          alt="펼치기"
          class="h-5 w-5 transition-transform"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </div>

    <div v-if="isExpanded" class="mt-2 space-y-2 px-4">
      <div v-if="routines.length > 0" class="space-y-2">
        <div
          v-for="routine in routines"
          :key="routine.id"
          @click="emit('edit-routine', routine)"
          class="flex cursor-pointer items-center justify-between rounded-r15 bg-gray-custom p-3 transition-colors hover:bg-gray-900"
        >
          <div class="flex items-center gap-4">
            <span class="pl-2 text-body text-white">{{ routine.title }}</span>
            <BaseTag :text="convertQuizTypeToLabel(routine.quizType)" />
          </div>
        </div>
      </div>
      <div v-else class="p-4 text-center">
        <p class="mb-3 text-body2 text-gray-300">
          최소 1개 이상의 루틴을 등록해주세요
        </p>
      </div>
    </div>
  </div>
</template>
