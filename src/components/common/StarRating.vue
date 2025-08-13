<script setup>
import starFilled from "@/assets/images/star_review.svg";
import starEmpty from "@/assets/images/star_review_empty.svg";

const props = defineProps({
  rating: {
    type: Number,
    required: true,
  },
  starSize: {
    type: String,
    default: "h-5 w-5",
  },
});

const fullStars = Math.floor(props.rating);
const emptyStars = 5 - fullStars;
</script>

<template>
  <div class="flex items-center space-x-0.5">
    <img
      v-for="i in fullStars"
      :key="'full-' + i"
      :src="starFilled"
      :class="starSize"
      alt="filled star"
    />
    <img
      v-for="i in emptyStars"
      :key="'empty-' + i"
      :src="starEmpty"
      :class="starSize"
      alt="empty star"
    />
  </div>
</template>
