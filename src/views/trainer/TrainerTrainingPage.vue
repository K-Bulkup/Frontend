<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import BaseBadge from "@/components/common/BaseBadge.vue";
import TrainingCard from "@/components/trainee/training/TrainingCard.vue";
import TrainerGreetingSimple from "@/components/trainer/training/TrainerGreetingSimple.vue";

const router = useRouter();
const searchQuery = ref("");

// "트레이닝 오픈" 버튼 클릭 시 호출되는 함수
const goToTrainingInput = () => {
  router.push("/trainer/training/input");
};

// 표시될 트레이닝 데이터
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

// 검색어에 따라 필터링된 트레이닝 목록을 반환하는 computed 속성
const filteredTrainings = computed(() => {
  if (!searchQuery.value) return trainings.value;
  return trainings.value.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.trainerName.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// 트레이닝 상세 페이지로 이동하는 함수
const goToDetail = (trainingId) => {
  router.push(`/training/${trainingId}`);
};

// PT 페이지로 이동하는 함수
const goToPtPage = () => {
  router.push("/trainee/mypage/pt");
};
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
