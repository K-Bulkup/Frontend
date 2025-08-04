<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import TrainingCard from "@/components/trainee/training/TrainingCard.vue"; // ✅ 카드 컴포넌트 임포트

const router = useRouter();
const searchQuery = ref("");

const trainings = ref([
  {
    id: 1,
    title: "예금관리의 기초",
    trainerName: "김헬스",
    price: 21000,
    rating: 4.8,
    tags: ["재무설계", "중급"],
  },
  {
    id: 2,
    title: "투자 입문 강좌",
    trainerName: "박강사",
    price: 35000,
    rating: 4.7,
    tags: ["투자입문", "초급"],
  },
  {
    id: 3,
    title: "주식 고급 과정",
    trainerName: "이전문가",
    price: 50000,
    rating: 4.9,
    tags: ["주식투자", "고급"],
  },
  {
    id: 4,
    title: "재무설계 실전편",
    trainerName: "최재무",
    price: 42000,
    rating: 4.6,
    tags: ["재무설계", "고급"],
  },
  {
    id: 5,
    title: "예금관리의 기초",
    trainerName: "김헬스",
    price: 21000,
    rating: 4.8,
    tags: ["재무설계", "중급"],
  },
  {
    id: 6,
    title: "예금관리의 기초",
    trainerName: "김헬스",
    price: 21000,
    rating: 4.8,
    tags: ["재무설계", "중급"],
  },
]);

const filteredTrainings = computed(() => {
  if (!searchQuery.value) return trainings.value;
  return trainings.value.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.trainerName.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

const goToDetail = (trainingId) => {
  router.push(`/training/${trainingId}`);
};

const goToPtPage = () => {
  router.push("/trainee/mypage/pt");
};
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
        v-for="training in filteredTrainings"
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
