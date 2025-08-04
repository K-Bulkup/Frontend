<script setup>
import BaseBadge from "@/components/common/BaseBadge.vue";

defineProps({
  training: {
    type: Object,
    required: true,
  },
});

const formattedPrice = (price) => {
  return price.toLocaleString();
};
</script>

<template>
  <div class="flex flex-col rounded-xl bg-gray-100 p-3 text-black shadow-sm">
    <div class="aspect-square w-full rounded-lg bg-gray-200"></div>

    <div class="mt-3 flex flex-grow flex-col">
      <h3 class="text-lg font-bold">{{ training.title }}</h3>

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
        <BaseBadge variant="outline">
          {{ training.tags[0] }}
        </BaseBadge>
        <BaseBadge variant="outline">
          {{ training.tags[1] }}
        </BaseBadge>
      </div>
    </div>
  </div>
</template>
