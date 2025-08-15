<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";

import TrainingCard from "@/components/trainee/training/home/TrainingCard.vue";
import BaseHeaderWithLogo from "@/components/trainer/mypage/HeaderWithLogo.vue";
import { getMyTrainings } from "@/composables/api/trainer/training/trainerTrainingAPI";

const router = useRouter();
const searchQuery = ref("");
const trainings = ref([]);
const selectedStatus = ref("open"); // 선택된 상태 필터

const goToTrainingInput = () => {
  router.push("/trainer/training/input");
};

const goToDetail = (trainingId) => {
  router.push(`/trainer/mypage/training/${trainingId}`);
};

const handleProfileClick = () => {
  // 프로필 클릭 시 동작 구현
  console.log("Profile clicked");
  // router.push('/profile');
};

// 상태 필터 변경 함수
const setStatusFilter = (status) => {
  selectedStatus.value = status;
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
      status: t.status,
      category: t.category,
    }));
  } catch (error) {
    console.error("내 트레이닝 목록 조회 실패:", error);
  }
};

// 필터링된 트레이닝 목록
const filteredTrainings = computed(() => {
  let filtered = trainings.value;

  // 검색어 필터
  if (searchQuery.value) {
    filtered = filtered.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  }

  // 트레이닝 승인 상태 필터
  if (selectedStatus.value !== "") {
    filtered = filtered.filter((t) => {
      const statusMapping = {
        open: "승인",
        pending: "대기",
        rejected: "거부",
      };
      return t.status === statusMapping[selectedStatus.value];
    });
  }

  return filtered;
});

// 버튼 활성화 상태를 위한 computed
const isStatusActive = (status) => {
  return selectedStatus.value === status;
};

// 검색어 변화 감지 (디바운스 처리)
let debounceTimer;
watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchMyTrainings(newVal.trim());
  }, 300);
});

onMounted(() => {
  fetchMyTrainings();
});
</script>

<template>
  <div class="px-4 pb-20">
    <!-- 상단 헤더 -->
    <div>
      <BaseHeaderWithLogo @profile-click="handleProfileClick" />
    </div>

    <!-- 트레이닝 추가 버튼과 카테고리 필터 -->
    <div class="mb-6 flex items-center justify-center gap-3">
      <!-- 트레이닝 추가 버튼 -->
      <button
        @click="goToTrainingInput"
        class="flex h-[37px] w-[107px] items-center justify-center gap-1 rounded-full bg-gray-900 px-2 text-button text-white transition-colors hover:bg-gray-800"
      >
        <span>+</span>
        <span>트레이닝 추가</span>
      </button>

      <!-- 오픈 필터 -->
      <button
        @click="setStatusFilter('open')"
        :class="[
          'flex h-[37px] w-[76px] items-center justify-center rounded-full border text-button transition-colors',
          isStatusActive('open')
            ? 'border-[#22E481] bg-[#22E481]/20 text-white'
            : 'border-gray-600 text-white hover:border-[#22E481] hover:bg-[#22E481]/20 hover:text-white',
        ]"
      >
        오픈
      </button>

      <!-- 대기 필터 -->
      <button
        @click="setStatusFilter('pending')"
        :class="[
          'flex h-[37px] w-[76px] items-center justify-center rounded-full border text-button transition-colors',
          isStatusActive('pending')
            ? 'border-[#22E481] bg-[#22E481]/20 text-white'
            : 'border-gray-600 text-white hover:border-[#22E481] hover:bg-[#22E481]/20 hover:text-white',
        ]"
      >
        대기
      </button>

      <!-- 반려 필터 -->
      <button
        @click="setStatusFilter('rejected')"
        :class="[
          'flex h-[37px] w-[76px] items-center justify-center rounded-full border text-button transition-colors',
          isStatusActive('rejected')
            ? 'border-[#22E481] bg-[#22E481]/20 text-white'
            : 'border-gray-600 text-white hover:border-[#22E481] hover:bg-[#22E481]/20 hover:text-white',
        ]"
      >
        반려
      </button>
    </div>

    <!-- 트레이닝 카드 그리드 -->
    <main
      v-if="filteredTrainings.length > 0"
      class="mb-6 grid grid-cols-3 gap-3"
    >
      <TrainingCard
        v-for="training in filteredTrainings"
        :key="training.id"
        :training="training"
        @click="goToDetail(training.id)"
        class="cursor-pointer"
      />
    </main>

    <div v-else class="flex h-64 items-center justify-center text-center">
      <p class="text-gray-400">
        {{
          selectedStatus === "all"
            ? "트레이닝이 없습니다."
            : selectedStatus === "open"
              ? "오픈된 트레이닝이 없습니다."
              : selectedStatus === "pending"
                ? "대기 중인 트레이닝이 없습니다."
                : "반려된 트레이닝이 없습니다."
        }}
      </p>
    </div>
  </div>
</template>
