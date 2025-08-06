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
    courseContainer.value.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  }
};

const scrollRight = () => {
  if (courseContainer.value) {
    courseContainer.value.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  }
};

const selectCourse = (course) => {
  router.push(`/trainee/mypage/training/${course.id}`);
};
</script>

<template>
  <div class="relative">
    <h2 class="mb-4 text-lg font-semibold text-white">수강 목록</h2>

    <button
      class="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
      @click="scrollLeft"
    >
      <ChevronLeft :size="20" />
    </button>

    <button
      class="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
      @click="scrollRight"
    >
      <ChevronRight :size="20" />
    </button>

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
  </div>
</template>
