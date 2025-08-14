<!-- src/pages/trainee/TraineeTrainingList.vue -->
<script setup>
import { ref, watch, onMounted, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import TrainingCard from "@/components/trainee/training/home/TrainingCard.vue";

import logo from "@/assets/images/mascot/logo.png";
// chatIcon.svg는 사용 안 함(인라인 SVG로 대체)

import { getTraineeTraining } from "@/composables/api/trainee/mypage/traineeTrainingApi";
import {
  getAllTrainings,
  searchTrainings,
} from "@/composables/api/trainee/training/useTrainingListApi";

// state
const router = useRouter();
const searchQuery = ref("");
const selectedCategory = ref("전체");
const categories = ref(["전체"]);
const allTrainingsCache = ref([]);
const currentSource = ref([]);
const trainings = ref([]);
const inProgress = ref([]);
const ipContainer = ref(null);

// helpers
const mapListItem = (t) => ({
  trainingId: t.trainingId,
  title: t.title,
  trainerName: t.trainerName,
  price: t.price,
  rating: t.averageRating,
  category: t.category,
  level: t.level,
  thumbnailUrl: t.thumbnailUrl,
  isPurchased: t.purchased ?? false,
});
const mapInProgressItem = (e) => ({
  trainingId: e.trainingId ?? e.training?.trainingId ?? e.training?.id ?? e.id,
  title: e.title ?? e.training?.title ?? "",
  thumbnailUrl:
    e.thumbnailUrl ?? e.training?.thumbnailUrl ?? e.training?.thumbnail_url,
  progress: e.progress ?? e.completionRate ?? e.rate ?? 0,
  isPurchased: true,
});

// API
const fetchInProgress = async () => {
  try {
    const raw = await getTraineeTraining();
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.content)
        ? raw.content
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.enrollments)
            ? raw.enrollments
            : [];
    inProgress.value = list.map(mapInProgressItem);
  } catch (e) {
    console.error("🚨 수강중인 트레이닝 조회 실패:", e);
    inProgress.value = [];
  }
};
const fetchAllTrainings = async () => {
  try {
    const res = await getAllTrainings();
    const raw = res?.data?.data ?? [];
    allTrainingsCache.value = raw.map(mapListItem);
    const uniq = Array.from(
      new Set(raw.map((t) => t.category).filter(Boolean)),
    );
    categories.value = ["전체", ...uniq];
    currentSource.value = [...allTrainingsCache.value];
    applyFilter();
  } catch (err) {
    console.error("🚨 전체 트레이닝 목록 조회 실패:", err);
  }
};
const fetchSearchResults = async (keyword) => {
  try {
    const res = await searchTrainings(keyword);
    const raw = res?.data?.data ?? [];
    currentSource.value = raw.map(mapListItem);
    applyFilter();
  } catch (err) {
    console.error("🚨 검색 실패:", err);
    currentSource.value = [];
    applyFilter();
  }
};

// filter
const applyFilter = () => {
  trainings.value =
    selectedCategory.value === "전체"
      ? [...currentSource.value]
      : currentSource.value.filter(
          (t) => String(t.category) === String(selectedCategory.value),
        );
};

// watchers
let debounceTimer;
watch(
  () => searchQuery.value,
  (v) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (!v.trim()) {
        currentSource.value = [...allTrainingsCache.value];
        applyFilter();
      } else {
        fetchSearchResults(v);
      }
    }, 300);
  },
);
watch(() => selectedCategory.value, applyFilter);

// in-progress pages (2개씩 세로 / 가로 스와이프)
const ipPages = computed(() => {
  const arr = inProgress.value || [];
  const pages = [];
  for (let i = 0; i < arr.length; i += 2) pages.push(arr.slice(i, i + 2));
  return pages;
});
const scrollCarousel = (dir = "next") => {
  const el = ipContainer.value;
  if (!el) return;
  const delta = dir === "next" ? el.clientWidth : -el.clientWidth;
  el.scrollBy({ left: Math.round(delta), behavior: "smooth" });
};

// nav
const goToDetail = (training) => {
  const purchased =
    training.isPurchased ||
    allTrainingsCache.value.find((t) => t.trainingId === training.trainingId)
      ?.isPurchased ||
    false;

  if (purchased) {
    router.push(`/trainee/mypage/training/${training.trainingId}`);
  } else {
    router.push(`/training/${training.trainingId}`);
  }
};

// PT 페이지 이동
const goToPtPage = () => {
  router.push("/common/pt/history");

  // lifecycle
};
onMounted(async () => {
  await Promise.all([fetchAllTrainings(), fetchInProgress()]);
  await nextTick();
});
</script>

<template>
  <div
    class="relative min-h-screen bg-realBlack px-4 pb-24 pt-4 font-sans text-white"
  >
    <!-- 상단: 로고 크게 + 채팅 버튼(오른쪽 끝, 세로 가운데). 아이콘=인라인 SVG -->
    <div class="mb-8 flex h-24 items-center justify-between pr-1 md:h-28">
      <img :src="logo" alt="KBULKUP" class="h-24 w-auto md:h-28" />
      <button
        type="button"
        @click="goToPtPage"
        aria-label="채팅"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-background text-primary shadow-md"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-6 w-6"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 3.5c-4.97 0-9 3.58-9 8 0 1.95.78 3.74 2.09 5.16a1 1 0 0 1 .24.67l-.08 1.84a.75.75 0 0 0 1.03.74l1.98-.79c.2-.08.43-.1.64-.06 1.01.22 2.07.34 3.1.34 4.97 0 9-3.58 9-8s-4.03-8-9-8Zm-6.5 8c0-3.31 3.14-6 7-6s7 2.69 7 6-3.14 6-7 6c-1 0-2.05-.12-3.06-.37-.46-.1-.95-.07-1.39.11l-1.06.43.04-.93c.02-.48-.16-.95-.5-1.31C6.78 13.5 5.5 11.83 5.5 11.5Z"
          />
        </svg>
      </button>
    </div>

    <!-- 수강중인 트레이닝 (더 큼) -->
    <section class="mb-8">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-input">수강중인 트레이닝</h2>
        <button
          type="button"
          @click="scrollCarousel('next')"
          class="text-body text-gray-200"
          aria-label="다음"
        >
          &gt;
        </button>
      </div>

      <div
        ref="ipContainer"
        class="flex snap-x snap-mandatory gap-5 overflow-x-auto scrollbar-hide"
        style="scroll-behavior: smooth"
      >
        <!-- 페이지(2개 세로) -->
        <div
          v-for="(page, idx) in ipPages"
          :key="idx"
          class="min-w-full snap-start"
        >
          <div class="flex flex-col gap-5">
            <div
              v-for="ip in page"
              :key="ip.trainingId"
              class="rounded-r15 bg-gray-custom px-5 py-5 shadow-md"
            >
              <button
                type="button"
                class="flex w-full items-center gap-4 text-left"
                @click="goToDetail(ip)"
              >
                <img
                  :src="ip.thumbnailUrl"
                  alt=""
                  class="h-16 w-16 flex-none rounded-r15 object-cover"
                />
                <div class="min-w-0 flex-1">
                  <div class="truncate text-subTitle2 font-medium">
                    {{ ip.title }}
                  </div>
                  <div
                    class="mt-2 flex items-center justify-between text-body2 text-white"
                  >
                    <span>진행률</span>
                    <span class="text-body2 text-primary"
                      >{{ Math.round(ip.progress || 0) }}%</span
                    >
                  </div>
                  <!-- 더 두껍게 -->
                  <div class="mt-1 h-[14px] w-full rounded-md bg-gray-900">
                    <div
                      class="h-[14px] rounded-md bg-primary"
                      :style="{ width: (ip.progress || 0) + '%' }"
                    />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="!inProgress.length"
          class="w-full py-3 text-body2 text-gray-600"
        >
          수강중인 트레이닝이 없습니다.
        </div>
      </div>
    </section>

    <!-- 트레이닝 목록 (모바일 2열 → 넓어지면 3열) -->
    <section class="mb-8">
      <h2 class="mb-3 text-input">트레이닝 목록</h2>

      <div class="relative mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="강의를 검색해보세요"
          class="h-10 w-full rounded-pill bg-gray-900 px-4 text-body2 text-gray-300 placeholder-gray-200 focus:outline-none"
        />
        <img
          src="@/assets/images/search.svg"
          alt=""
          class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2"
        />
      </div>

      <div class="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          v-for="c in categories"
          :key="c"
          class="whitespace-nowrap rounded-pill border px-3 py-1 text-body3"
          :class="
            selectedCategory === c
              ? 'border-transparent bg-primary text-black'
              : 'border-gray-700 text-gray-200'
          "
          @click="selectedCategory = c"
          type="button"
        >
          {{ c }}
        </button>
      </div>
    </section>

    <!-- 여기서 카드 더 크게 보기 위해 모바일 2열, sm 이상 3열 -->
    <main class="grid grid-cols-2 gap-5 sm:grid-cols-3">
      <TrainingCard
        v-for="training in trainings"
        :key="training.trainingId"
        :training="training"
        @click="goToDetail(training)"
        class="cursor-pointer"
      />
    </main>
  </div>
</template>
