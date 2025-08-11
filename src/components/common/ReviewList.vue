<script setup>
import { ref } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

defineProps({
  reviews: {
    type: Array,
    required: true,
  },
});

const reviewContainer = ref(null);

const scrollLeft = () => {
  if (reviewContainer.value) {
    const cardWidth = reviewContainer.value.children[0]?.offsetWidth || 0;
    const gap = 16;
    const scrollDistance = cardWidth + gap;

    reviewContainer.value.scrollBy({
      left: -scrollDistance,
      behavior: "smooth",
    });
  }
};

const scrollRight = () => {
  if (reviewContainer.value) {
    const cardWidth = reviewContainer.value.children[0]?.offsetWidth || 0;
    const gap = 16;
    const scrollDistance = cardWidth + gap;

    reviewContainer.value.scrollBy({
      left: scrollDistance,
      behavior: "smooth",
    });
  }
};
</script>

<template>
  <div class="mt-8">
    <h2 class="mb-4 text-lg font-semibold text-white">수강생 리뷰</h2>

    <div v-if="reviews && reviews.length > 0">
      <div
        ref="reviewContainer"
        class="flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style="scrollbar-width: none; -ms-overflow-style: none"
      >
        <div
          v-for="review in reviews"
          :key="review.id"
          class="rounded-2xl bg-gray-100 p-4 text-black"
          style="
            min-width: calc((100% - 2rem) / 3);
            flex: 0 0 calc((100% - 2rem) / 3);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          "
        >
          <div>
            <p class="mb-2 text-base font-bold">{{ review.author }}</p>

            <div class="mb-3 flex items-center">
              <div v-for="star in 5" :key="star" class="h-5 w-5">
                <svg
                  class="h-full w-full"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L15.09 8.26L22 9L17 13.74L18.18 20.42L12 17.27L5.82 20.42L7 13.74L2 9L8.91 8.26L12 2Z"
                    :stroke="star <= review.rating ? '#FFD700' : '#D0D0D0'"
                    :fill="star <= review.rating ? '#FFD700' : '#D0D0D0'"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>

            <p class="text-sm leading-snug text-gray-700">
              {{ review.content }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-4 flex justify-center gap-4 text-white">
        <button
          class="rounded-full p-2 transition-colors hover:bg-gray-700"
          @click="scrollLeft"
        >
          <ChevronLeft :size="20" />
        </button>
        <button
          class="rounded-full p-2 transition-colors hover:bg-gray-700"
          @click="scrollRight"
        >
          <ChevronRight :size="20" />
        </button>
      </div>
    </div>

    <div v-else class="rounded-2xl bg-gray-800 p-8 text-center text-gray-400">
      <p>등록된 리뷰가 없습니다.</p>
    </div>
  </div>
</template>
