<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import TrainingCard from "@/components/trainee/training/home/TrainingCard.vue";
import BaseHeaderWithoutBack from "@/components/common/BaseHeaderWithoutBack.vue";
import {
  getAllTrainings,
  searchTrainings,
} from "@/composables/api/trainee/training/useTrainingListApi";

const router = useRouter();
const searchQuery = ref("");
const trainings = ref([]);
const allTrainingsCache = ref([]); // 전체 목록 캐시

// 전체 트레이닝 불러오기
const fetchAllTrainings = async () => {
  try {
    const res = await getAllTrainings();
    console.log("✅ 전체 목록 API 응답:", res.data.data);

    allTrainingsCache.value = res.data.data.map((t) => ({
      trainingId: t.trainingId,
      title: t.title,
      trainerName: t.trainerName,
      price: t.price,
      rating: t.averageRating,
      tags: [t.category, t.level],
      thumbnailUrl: t.thumbnailUrl,
      isPurchased: t.purchased ?? false, // 필드명 수정
    }));
    trainings.value = [...allTrainingsCache.value];
  } catch (err) {
    console.error("🚨 전체 트레이닝 목록 조회 실패:", err);
  }
};

// 검색 API 호출
const fetchSearchResults = async (keyword) => {
  try {
    const res = await searchTrainings(keyword);
    console.log("✅ 검색 API 응답:", res.data.data);

    trainings.value = res.data.data.map((t) => ({
      trainingId: t.trainingId,
      title: t.title,
      trainerName: t.trainerName,
      price: t.price,
      rating: t.averageRating,
      tags: [t.category, t.level],
      thumbnailUrl: t.thumbnailUrl,
      isPurchased: t.purchased ?? false, // 백엔드에서 안 내려오면 false
    }));
  } catch (err) {
    console.error("🚨 검색 실패:", err);
  }
};

// 검색어 감지 (디바운스)
let debounceTimer;
watch(searchQuery, (newValue) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!newValue.trim()) {
      trainings.value = [...allTrainingsCache.value];
    } else {
      fetchSearchResults(newValue);
    }
  }, 300);
});

// 상세 페이지 이동
const goToDetail = (training) => {
  console.log("📌 클릭한 트레이닝:", training);

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
  router.push("/common/pt-history");
};

// 최초 전체 목록 로딩
fetchAllTrainings();
</script>

<template>
  <div class="relative min-h-screen bg-realBlack px-4 pb-24 pt-4">
    <BaseHeaderWithoutBack title="트레이닝 목록" />
    <div class="relative mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="강의명 / 강사명 입력"
        class="h-12 w-full rounded-3xl bg-gray-800 py-2 pl-10 pr-4 text-white placeholder-gray-200 focus:outline-none"
      />
      <img
        src="@/assets/images/search.svg"
        alt="검색"
        class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
      />
    </div>

    <main class="grid grid-cols-2 gap-4">
      <TrainingCard
        v-for="training in trainings"
        :key="training.trainingId"
        :training="training"
        @click="goToDetail(training)"
        class="cursor-pointer"
      />
    </main>
  </div>

  <button
    @click="goToPtPage"
    class="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
    style="right: max(1rem, calc(50vw - 180px))"
  >
    <img
      src="@/assets/images/trainee/training/Chat_Circle.svg"
      alt="채팅"
      class="h-7 w-7"
    />
  </button>
</template>
