<script setup>
import BaseTag from "@/components/common/BaseTag.vue";

defineProps({
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
        <div class="h-[60px] w-[60px] rounded-[15px] bg-gray-800"></div>
        <div class="flex flex-col pl-2">
          <span class="text-body text-white">{{ title }}</span>
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
          class="rounded-r15 flex cursor-pointer items-center justify-between bg-gray-custom p-3 transition-colors hover:bg-gray-900"
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
