<!-- src/pages/trainee/TraineeTrainingList.vue -->
<script setup>
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
} from "vue";
import { useRouter } from "vue-router";
import TrainingCard from "@/components/trainee/training/home/TrainingCard.vue";

import logo from "@/assets/images/mascot/logo.png";

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

// 캐러셀 페이지 상태
const activePage = ref(0);
const ipPages = computed(() => {
  const arr = inProgress.value || [];
  const pages = [];
  for (let i = 0; i < arr.length; i += 2) pages.push(arr.slice(i, i + 2)); // 2개씩 세로
  return pages;
});
const totalPages = computed(() => ipPages.value.length);

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

// 캐러셀 이동 & 페이지 추적
const handleScroll = () => {
  const el = ipContainer.value;
  if (!el) return;
  const idx = Math.round(el.scrollLeft / el.clientWidth);
  activePage.value = Math.min(Math.max(idx, 0), totalPages.value - 1);
};
const scrollToPage = (idx) => {
  const el = ipContainer.value;
  if (!el) return;
  const next = Math.min(Math.max(idx, 0), totalPages.value - 1);
  el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  activePage.value = next;
};
const goPrev = () => scrollToPage(activePage.value - 1);
const goNext = () => scrollToPage(activePage.value + 1);

// nav
const goToDetail = (training) => {
  const purchased =
    training.isPurchased ||
    allTrainingsCache.value.find((t) => t.trainingId === training.trainingId)
      ?.isPurchased ||
    false;
  if (purchased) router.push(`/trainee/mypage/training/${training.trainingId}`);
  else router.push(`/training/${training.trainingId}`);
};
const goToPtPage = () => router.push("/common/pt-history");

// lifecycle
onMounted(async () => {
  await Promise.all([fetchAllTrainings(), fetchInProgress()]);
  await nextTick();
  if (ipContainer.value) {
    ipContainer.value.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    handleScroll();
  }
});
onBeforeUnmount(() => {
  if (ipContainer.value) {
    ipContainer.value.removeEventListener("scroll", handleScroll);
  }
});
</script>

<template>
  <div class="relative min-h-screen px-4 pb-24 pt-2 font-sans text-white">
    <!-- 상단: 로고 + 채팅 버튼(보더 추가) -->
    <div class="mb-4 flex h-20 items-center justify-between pr-1 md:h-24">
      <img :src="logo" alt="KBULKUP" class="h-20 w-auto md:h-24" />
      <button
        type="button"
        @click="goToPtPage"
        aria-label="채팅"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 text-primary shadow-md hover:bg-gray-900/40"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-6 w-6"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 3.5c-4.97 0-9 3.58-9 8 0 1.95.78 3.74 2.09 5.16a1 1 0 0 1 .24.67l-.08 1.84a.75.75 0 0 0 1.03.74l1.98-.79c.2-.08.43-.1.64-.06 1.01.22 2.07.34 3.1.34 4.97 0 9-3.58 9-8s-4.03-8-9-8Zm-6.5 8c0-3.31 3.14-6 7-6s7 2.69 7 6-3.14 6-7 6c-1 0-2.05-.12-3.06-.37-.46-.1-.95-.07-1.39.11l-1.06.43.04-.93c.02-.48-.16-.95-.5-1.31C6.78 13.5 5.5 11.83 5.5 11.5Z"
          />
        </svg>
      </button>
    </div>

    <!-- 수강중인 트레이닝 (섹션 폭 원상복구) -->
    <section class="mb-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-input">수강중인 트레이닝</h2>
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
                  <div class="truncate text-body font-medium">
                    {{ ip.title }}
                  </div>
                  <div
                    class="mt-2 flex items-center justify-between text-body2 text-white"
                  >
                    <span>진행률</span>
                    <span class="text-body2 text-primary">
                      {{ Math.round(ip.progress || 0) }}%
                    </span>
                  </div>
                  <div class="mt-2 h-[10px] w-full rounded-md bg-gray-600">
                    <div
                      class="h-[10px] rounded-md bg-primary"
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

    <!-- 캐러셀 컨트롤: 센터 정렬, 검색창 위 -->
    <div
      v-if="totalPages > 1"
      class="mb-6 flex items-center justify-center gap-6"
    >
      <button
        type="button"
        @click="goPrev"
        :disabled="activePage === 0"
        class="rounded-full border px-3 py-1 text-xl leading-none transition-colors"
        :class="
          activePage === 0
            ? 'cursor-not-allowed border-gray-800 text-gray-700'
            : 'border-gray-600 text-white hover:border-primary hover:bg-primary/20'
        "
        aria-label="이전"
      >
        ‹
      </button>

      <div class="text-body2 text-gray-300">
        {{ activePage + 1 }} / {{ totalPages }}
      </div>

      <button
        type="button"
        @click="goNext"
        :disabled="activePage >= totalPages - 1"
        class="rounded-full border px-3 py-1 text-xl leading-none transition-colors"
        :class="
          activePage >= totalPages - 1
            ? 'cursor-not-allowed border-gray-800 text-gray-700'
            : 'border-gray-600 text-white hover:border-primary hover:bg-primary/20'
        "
        aria-label="다음"
      >
        ›
      </button>
    </div>

    <!-- 트레이닝 목록 -->
    <section class="mb-6">
      <h2 class="mb-3 text-input">트레이닝 목록</h2>

      <!-- 검색 -->
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

      <!-- 카테고리 칩: 한 줄 유지 + 가로 스크롤 -->
      <div class="-mx-1 mb-4 overflow-x-auto scrollbar-hide">
        <div class="flex gap-2 whitespace-nowrap px-1">
          <button
            v-for="c in categories"
            :key="c"
            class="rounded-full border px-3 py-1 text-button transition-colors"
            :class="
              selectedCategory === c
                ? 'border-primary bg-primary/30 text-white'
                : 'border-gray-600 text-white hover:border-primary hover:bg-primary/20'
            "
            @click="selectedCategory = c"
            type="button"
          >
            {{ c }}
          </button>
        </div>
      </div>
    </section>

    <!-- 카드 그리드: 모바일 2열, sm↑ 3열 -->
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
