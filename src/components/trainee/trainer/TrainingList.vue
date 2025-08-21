<script setup>
import { ref } from "vue";
import { Image, ChevronLeft, ChevronRight } from "lucide-vue-next";

defineProps({
  courses: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["selectTraining"]);

const courseContainer = ref(null);

// 스크롤 로직을 동적으로 개선
const scroll = (direction) => {
  if (courseContainer.value) {
    const card = courseContainer.value.children[0];
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * direction;

    courseContainer.value.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  }
};
</script>

<template>
  <div>
    <h2 class="mb-4 text-lg font-semibold text-white">트레이닝 목록</h2>

    <div
      ref="courseContainer"
      class="flex gap-4 overflow-x-auto scroll-smooth pb-4"
      style="scrollbar-width: none; -ms-overflow-style: none"
    >
      <div
        v-for="course in courses"
        :key="course.trainingId"
        @click="$emit('selectTraining', course.trainingId)"
        class="cursor-pointer rounded-2xl bg-gray-100 p-4 transition-colors hover:bg-gray-300"
        style="
          min-width: calc((100% - 2rem) / 3);
          flex: 0 0 calc((100% - 2rem) / 3);
        "
      >
        <div
          class="mb-1 flex h-16 w-full items-center justify-center overflow-hidden rounded-lg bg-white"
        >
          <img
            v-if="course.thumbnailUrl"
            :src="course.thumbnailUrl"
            alt="트레이닝 썸네일"
            class="h-full w-full object-cover"
          />
          <Image v-else :size="30" class="text-gray-700" />
        </div>

        <p
          class="mb-1 line-clamp-2 min-h-[32px] text-xs font-bold leading-tight text-black"
        >
          {{ course.title }}
        </p>
      </div>
    </div>

    <div class="mt-4 flex justify-center gap-4 text-white">
      <button
        class="rounded-full p-2 backdrop-blur-sm transition-all hover:bg-white/10"
        @click="scroll(-1)"
      >
        <ChevronLeft :size="20" />
      </button>
      <button
        class="rounded-full p-2 backdrop-blur-sm transition-all hover:bg-white/10"
        @click="scroll(1)"
      >
        <ChevronRight :size="20" />
      </button>
    </div>
  </div>
</template>
