<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import BaseBadge from "@/components/common/BaseBadge.vue";
import TrainingCard from "@/components/trainee/training/TrainingCard.vue";
import TrainerGreetingSimple from "@/components/trainer/training/TrainerGreetingSimple.vue";

import { getMyTrainings } from "@/composables/api/trainer/training/trainerTrainingAPI";

const router = useRouter();
const searchQuery = ref("");
const trainings = ref([]);

// "트레이닝 오픈" 버튼 클릭 시 호출되는 함수
const goToTrainingInput = () => {
  router.push("/trainer/training/input");
};

// 트레이닝 상세 페이지로 이동하는 함수
const goToDetail = (trainingId) => {
  router.push(`/trainer/mypage/training/${trainingId}`);
};

// API 호출: 내 트레이닝 목록 + 검색
const fetchMyTrainings = async (keyword = "") => {
  try {
    const res = await getMyTrainings(keyword);
    trainings.value = res.data.data.map((t) => ({
      id: t.trainingId,
      title: t.title,
      trainerName: t.trainerName,
      price: t.price,
      rating: t.averageRating,
      tags: [t.category, t.level],
      thumbnailUrl: t.thumbnailUrl,
    }));
  } catch (error) {
    console.error("내 트레이닝 목록 조회 실패:", error);
  }
};

const filteredTrainings = computed(() => {
  if (!searchQuery.value) return trainings.value;
  return trainings.value.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// 검색어 변화 감지 (디바운스 처리)
let debounceTimer;
watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchMyTrainings(newVal.trim());
  }, 300);
});

// 최초 렌더링 시 내 강의 목록 호출
fetchMyTrainings();
</script>

<template>
  <div class="relative min-h-screen bg-realBlack px-4 pb-24 pt-4">
    <div class="justify-betwee mb-6 flex items-center">
      <!-- 트레이너 인사말 -->
      <TrainerGreetingSimple></TrainerGreetingSimple>

      <div class="mb-6 flex justify-end">
        <BaseBadge
          variant="primary"
          class="cursor-pointer"
          @click="goToTrainingInput"
        >
          트레이닝 오픈
        </BaseBadge>
      </div>
    </div>

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
        v-for="training in filteredTrainings"
        :key="training.id"
        :training="training"
        @click="goToDetail(training.id)"
        class="cursor-pointer"
      />
    </main>
  </div>
</template>
