<script setup>
import StarRating from "@/components/common/StarRating.vue";

defineProps({
  averageRating: {
    type: Number,
    required: true,
  },
  totalReviews: {
    type: Number,
    required: true,
  },
  reviews: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="mb-6 flex items-end justify-between">
    <span class="text-5xl font-bold text-gray-300">{{
      averageRating.toFixed(1)
    }}</span>

    <div class="text-right">
      <StarRating :rating="averageRating" star-size="h-6 w-6" />
      <p class="mt-1 text-body2 text-gray-50">{{ totalReviews }}개의 평가</p>
    </div>
  </div>

  <div v-if="reviews && reviews.length > 0" class="space-y-4">
    <div
      v-for="review in reviews"
      :key="review.id"
      class="rounded-r15 bg-gray-custom p-4"
    >
      <div class="mb-2 flex items-center gap-2">
        <span class="text-body2 font-bold text-gray-50">{{
          review.author
        }}</span>
        <StarRating :rating="review.rating" star-size="h-3 w-3" />
      </div>
      <p class="text-body2 text-gray-50">
        {{ review.content }}
      </p>
    </div>
  </div>

  <div
    v-else
    class="rounded-r15 bg-gray-custom p-8 text-center text-body2 text-gray-200"
  >
    <p>등록된 리뷰가 없습니다</p>
  </div>
</template>
