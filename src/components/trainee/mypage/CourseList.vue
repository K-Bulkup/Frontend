<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Image, ChevronLeft, ChevronRight } from "lucide-vue-next";

defineProps({
  courses: {
    type: Array,
    required: true,
  },
});

const router = useRouter();
const courseContainer = ref(null);

const scrollLeft = () => {
  if (courseContainer.value) {
    const cardWidth = courseContainer.value.children[0]?.offsetWidth || 0;
    const gap = 16; // gap-4 = 1rem = 16px
    const scrollDistance = (cardWidth + gap) * 3;

    courseContainer.value.scrollBy({
      left: -scrollDistance,
      behavior: "smooth",
    });
  }
};

const scrollRight = () => {
  if (courseContainer.value) {
    const cardWidth = courseContainer.value.children[0]?.offsetWidth || 0;
    const gap = 16;
    const scrollDistance = (cardWidth + gap) * 3;

    courseContainer.value.scrollBy({
      left: scrollDistance,
      behavior: "smooth",
    });
  }
};

const selectCourse = (course) => {
  router.push(`/trainee/mypage/training/${course.id}`);
};
</script>

<template>
  <div>
    <h2 class="mb-4 text-lg font-semibold text-white">수강 목록</h2>

    <div
      ref="courseContainer"
      class="flex gap-4 overflow-x-auto scroll-smooth pb-4"
      style="scrollbar-width: none; -ms-overflow-style: none"
    >
      <div
        v-for="course in courses"
        :key="course.id"
        class="cursor-pointer rounded-2xl bg-gray-100 p-4 transition-colors hover:bg-gray-300"
        style="
          min-width: calc((100% - 2rem) / 3);
          flex: 0 0 calc((100% - 2rem) / 3);
        "
        @click="selectCourse(course)"
      >
        <div class="mb-1 flex h-16 items-center justify-center rounded-lg">
          <Image :size="30" class="text-gray-700" />
        </div>

        <p class="mb-1 text-xs font-bold leading-tight text-black">
          {{ course.title }}
        </p>

        <div class="space-y-1">
          <p class="text-right text-xs font-medium text-black">
            {{ course.progress }}%
          </p>
          <div class="h-1.5 w-full rounded-full bg-white">
            <div
              class="h-1.5 rounded-full bg-gray-800 transition-all duration-300"
              :style="{ width: course.progress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-center gap-4">
      <button class="p-2 backdrop-blur-sm transition-all" @click="scrollLeft">
        <ChevronLeft :size="20" />
      </button>

      <button class="p-2 backdrop-blur-sm transition-all" @click="scrollRight">
        <ChevronRight :size="20" />
      </button>
    </div>
  </div>
</template>
