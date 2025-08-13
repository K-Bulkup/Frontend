<script setup>
import { computed } from "vue";

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

const roundedRating = computed(() => {
  return Math.round(props.rating * 2) / 2;
});

const getStarFill = (starIndex) => {
  const ratingValue = roundedRating.value;

  // 꽉 찬 별
  if (starIndex <= Math.floor(ratingValue)) {
    return "#FFD700";
  }
  // 반쪽 별
  if (starIndex === Math.ceil(ratingValue) && ratingValue % 1 !== 0) {
    return "url(#half-gradient-gray)";
  }
  return "#E0E0E0";
};
</script>

<template>
  <div class="flex items-center">
    <svg
      v-for="i in 5"
      :key="i"
      :class="starSize"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="half-gradient-gray">
          <stop offset="50%" stop-color="#FFD700" />
          <stop offset="50%" stop-color="#E0E0E0" />
        </linearGradient>
      </defs>

      <path
        d="M12 2L15.09 8.26L22 9L17 13.74L18.18 20.42L12 17.27L5.82 20.42L7 13.74L2 9L8.91 8.26L12 2Z"
        :fill="getStarFill(i)"
      />
    </svg>
  </div>
</template>
