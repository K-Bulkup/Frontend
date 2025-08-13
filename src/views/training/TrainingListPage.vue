<!-- src/pages/trainee/TraineeTrainingList.vue -->
<script setup>
import { ref, watch, onMounted, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import TrainingCard from "@/components/trainee/training/home/TrainingCard.vue";

import logo from "@/assets/images/mascot/logo.png";
import chatIcon from "@/assets/images/trainee/training/Chat_Circle.svg";

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

  if (purchased) router.push(`/trainee/mypage/training/${training.trainingId}`);
  else router.push(`/training/${training.trainingId}`);
};

const goToPtPage = () => router.push("/common/pt-history");

// lifecycle
onMounted(async () => {
  await Promise.all([fetchAllTrainings(), fetchInProgress()]);
  await nextTick();
});
</script>

<template>
  <div
    class="relative min-h-screen bg-realBlack px-4 pb-24 pt-4 font-sans text-white"
  >
    <!-- 상단 영역: 로고 크게 + 채팅 버튼 '가운데 정렬 & 오른쪽 끝' -->
    <div class="mb-8 flex h-24 items-center justify-between pr-1 md:h-28">
      <img :src="logo" alt="KBULKUP" class="h-24 w-auto md:h-28" />
      <button
        type="button"
        @click="goToPtPage"
        aria-label="채팅"
        class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-black shadow-md"
      >
        <img :src="chatIcon" alt="" class="h-5 w-5" />
      </button>
    </div>

    <!-- 수강중인 트레이닝 -->
    <section class="mb-8">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-subTitle">수강중인 트레이닝</h2>
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
        class="flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-hide"
        style="scroll-behavior: smooth"
      >
        <!-- 페이지(2개 세로) -->
        <div
          v-for="(page, idx) in ipPages"
          :key="idx"
          class="min-w-full snap-start"
        >
          <div class="flex flex-col gap-4">
            <div
              v-for="ip in page"
              :key="ip.trainingId"
              class="rounded-r15 bg-gray-800 px-4 py-4 shadow-md"
            >
              <button
                type="button"
                class="flex w-full items-center gap-3 text-left"
                @click="goToDetail(ip)"
              >
                <img
                  :src="ip.thumbnailUrl"
                  alt=""
                  class="rounded-r15 h-14 w-14 flex-none object-cover"
                />
                <div class="min-w-0 flex-1">
                  <div class="truncate text-body font-medium">
                    {{ ip.title }}
                  </div>

                  <!-- 진행률: 더 크고(높이 h-3) 덜 둥글게(rounded-md) -->
                  <div
                    class="mt-2 flex items-center justify-between text-body2 text-gray-200"
                  >
                    <span>진행률</span>
                    <span>{{ Math.round(ip.progress || 0) }}%</span>
                  </div>
                  <div class="mt-1 h-3 w-full rounded-md bg-gray-700">
                    <div
                      class="h-3 rounded-md bg-primary"
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
          class="w-full py-3 text-body2 text-gray-500"
        >
          수강중인 트레이닝이 없습니다.
        </div>
      </div>
    </section>

    <!-- 트레이닝 목록 -->
    <section class="mb-8">
      <h2 class="mb-3 text-subTitle">트레이닝 목록</h2>

      <!-- 검색 -->
      <div class="relative mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="강의를 검색해보세요"
          class="rounded-pill h-10 w-full bg-gray-800 px-4 text-input placeholder-gray-200 focus:outline-none"
        />
        <img
          src="@/assets/images/search.svg"
          alt=""
          class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2"
        />
      </div>

      <!-- 카테고리 칩 -->
      <div class="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          v-for="c in categories"
          :key="c"
          class="rounded-pill whitespace-nowrap border px-3 py-1 text-body2"
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

    <!-- 3열 리스트 -->
    <main class="grid grid-cols-3 gap-4">
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
