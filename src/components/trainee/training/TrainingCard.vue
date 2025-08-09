<script setup>
import { computed } from "vue";
import BaseBadge from "@/components/common/BaseBadge.vue";

const props = defineProps({
  training: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const formattedPrice = (price) => {
  return price.toLocaleString();
};

const emit = defineEmits(["click"]);

const statusText = computed(() => {
  switch (props.status) {
    case "승인":
      return "운영중";
    case "대기":
      return "승인대기";
    case "거부":
      return "반려됨";
    default:
      return "";
  }
});

const statusClass = computed(() => {
  switch (props.status) {
    case "승인":
      return "bg-blue-500 text-white";
    case "대기":
      return "bg-yellow-500 text-black";
    case "거부":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-400 text-white";
  }
});
</script>

<template>
  <div
    @click="emit('click')"
    class="flex flex-col rounded-xl bg-white p-3 text-black shadow-md transition-shadow hover:shadow-lg"
  >
    <div
      class="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-200"
    >
      <img
        v-if="training.thumbnailUrl"
        :src="training.thumbnailUrl"
        alt="트레이닝 썸네일"
        class="h-full w-full object-cover"
      />
      <div
        v-if="statusText"
        :class="statusClass"
        class="absolute right-2 top-2 rounded-full px-3 py-1 text-xs font-bold"
      >
        {{ statusText }}
      </div>
    </div>

    <div class="mt-3 flex flex-grow flex-col">
      <h3 class="truncate text-lg font-bold">{{ training.title }}</h3>

      <div class="mt-1 flex items-center justify-between">
        <p class="text-sm text-gray-600">{{ training.trainerName }}</p>
        <div class="flex items-center gap-1 text-sm">
          <img src="@/assets/images/star.svg" alt="별점" class="h-3 w-3" />
          <span class="font-semibold text-gray-700">{{ training.rating }}</span>
        </div>
      </div>

      <p class="mt-1 text-base font-bold">
        {{ formattedPrice(training.price) }}원
      </p>

      <div class="mt-auto flex justify-between pt-4">
        <BaseBadge variant="outline">{{ training.tags[0] }}</BaseBadge>
        <BaseBadge variant="outline">{{ training.tags[1] }}</BaseBadge>
      </div>
    </div>
  </div>
</template>
