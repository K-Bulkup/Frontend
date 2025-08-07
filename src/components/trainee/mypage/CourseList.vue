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
        <!-- ✅ 썸네일 이미지 or 기본 아이콘 -->
        <div
          class="mb-1 flex h-16 w-full items-center justify-center overflow-hidden rounded-lg bg-white"
        >
          <img
            v-if="course.thumbnailUrl"
            :src="course.thumbnailUrl"
            alt="썸네일"
            class="h-full w-auto object-contain"
          />
          <Image v-else :size="30" class="text-gray-700" />
        </div>

        <!-- 트레이닝 제목 -->
        <p
          class="mb-1 line-clamp-2 min-h-[32px] text-xs font-bold leading-tight text-black"
        >
          {{ course.title }}
        </p>

        <!-- 진행률 바 -->
        <div class="space-y-1">
          <p
            class="text-left text-xs font-medium text-black"
            style="min-width: 32px; display: inline-block"
          >
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

    <!-- 좌우 이동 버튼 -->
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
