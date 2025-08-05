<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import TrainingCard from "@/components/trainee/training/TrainingCard.vue";
import {
  getAllTrainings,
  searchTrainings,
} from "@/composables/api/trainee/training/useTrainingListApi";

const router = useRouter();
const searchQuery = ref("");
const trainings = ref([]);

// 하드코딩된 결제 완료 ID (임시)
const purchasedTrainingIds = [2001]; // 테스트용 결제된 트레이닝 ID 넣기

// 전체 트레이닝 불러오기
const fetchAllTrainings = async () => {
  try {
    const res = await getAllTrainings();
    trainings.value = res.data.data.map((t) => ({
      id: t.trainingId,
      title: t.title,
      trainerName: t.trainerName,
      price: t.price,
      rating: t.averageRating,
      tags: [t.category, t.level],
      thumbnailUrl: t.thumbnailUrl,
      // 나중에 백엔드 isPurchased 추가되면 여기도 그대로 들어올 예정
      isPurchased: t.isPurchased ?? false,
    }));
  } catch (err) {
    console.error("🚨 전체 트레이닝 목록 조회 실패:", err);
  }
};

// 검색 API 호출
const fetchSearchResults = async (keyword) => {
  try {
    const res = await searchTrainings(keyword);
    trainings.value = res.data.data.map((t) => ({
      id: t.trainingId,
      title: t.title,
      trainerName: t.trainerName,
      price: t.price,
      rating: t.averageRating,
      tags: [t.category, t.level],
      thumbnailUrl: t.thumbnailUrl,
      isPurchased: t.isPurchased ?? false,
    }));
  } catch (err) {
    console.error("🚨 검색 실패:", err);
  }
};

// 디바운스 처리 (검색어 입력 시 자동 검색)
let debounceTimer;
watch(searchQuery, (newValue) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!newValue.trim()) {
      fetchAllTrainings(); // 검색어 없으면 전체 목록 복귀
    } else {
      fetchSearchResults(newValue);
    }
  }, 300);
});

// 상세 페이지 이동 (현재: 하드코딩된 purchasedTrainingIds 사용)
const goToDetail = (trainingId) => {
  if (purchasedTrainingIds.includes(trainingId)) {
    router.push(`/trainee/mypage/training/${trainingId}`); // 결제 후 페이지
  } else {
    router.push(`/training/${trainingId}`); // 결제 전 페이지
  }

  /* 
  [나중에 백엔드 isPurchased 필드 추가 시 사용할 코드]
  const training = trainings.value.find(t => t.id === trainingId);
  if (training?.isPurchased) {
    router.push(`/trainee/mypage/training/${trainingId}`);
  } else {
    router.push(`/training/${trainingId}`);
  }
  */
};

// PT 페이지 이동
const goToPtPage = () => {
  router.push("/trainee/mypage/pt");
};

// 최초 전체 목록 로딩
fetchAllTrainings();
</script>

<template>
  <div class="relative min-h-screen bg-realBlack px-4 pb-24 pt-4">
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
        :key="training.id"
        :training="training"
        @click="goToDetail(training.id)"
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
