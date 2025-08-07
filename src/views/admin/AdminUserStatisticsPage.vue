<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useAdminUserApi } from "@/composables/api/useAdminUserApi";
import { Line } from 'vue-chartjs';
import BaseButton from "@/components/common/BaseButton.vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const { getUserSignupsStatistics } = useAdminUserApi();

const selectedRole = ref("ALL"); // ALL, TRAINER, TRAINEE
const selectedPeriod = ref("daily"); // daily, weekly, monthly, yearly

const todayNewUsers = ref(0);
const totalUsers = ref(0);
const statisticsData = ref([]); // 기간별 통계 데이터를 저장할 배열

const chartData = computed(() => {
  const labels = statisticsData.value.map((stat) => stat.dateLabel);
  const data = statisticsData.value.map((stat) => stat.signupCount);

  return {
    labels: labels,
    datasets: [
      {
        label: "가입자 수",
        backgroundColor: "#f87979",
        borderColor: "#f87979",
        data: data,
        tension: 0.4, // 꺾은선 부드럽게
      },
    ],
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
    },
    tooltip: {
      mode: "index",
      intersect: false,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "기간",
      },
    },
    y: {
      title: {
        display: true,
        text: "가입자 수",
      },
      beginAtZero: true,
    },
  },
});

const loadStatistics = async () => {
  try {
    // 1. 오늘 증가한 회원 수 (선택된 역할에 따라 필터링)
    const dailyStats = await getUserSignupsStatistics(
      "daily",
      selectedRole.value === "ALL" ? null : selectedRole.value,
    );
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayDateLabel = `${year}-${month}-${day}`;

    const todayData = dailyStats.find(
      (stat) => stat.dateLabel === todayDateLabel,
    );
    todayNewUsers.value = todayData ? todayData.signupCount : 0;

    // 2. 총 회원 수 (선택된 역할에 따라 필터링)
    const totalStats = await getUserSignupsStatistics(
      "all_time",
      selectedRole.value === "ALL" ? null : selectedRole.value,
    );
    totalUsers.value = totalStats.length > 0 ? totalStats[0].signupCount : 0;

    // 3. 기간별 통계 데이터 (선택된 기간과 역할에 따라 필터링)
    statisticsData.value = await getUserSignupsStatistics(
      selectedPeriod.value,
      selectedRole.value === "ALL" ? null : selectedRole.value,
    );
  } catch (error) {
    console.error("회원 통계 가져오기 실패:", error);
  }
};

const selectRole = (role) => {
  selectedRole.value = role;
};

const selectPeriod = (period) => {
  selectedPeriod.value = period;
};

// selectedRole 또는 selectedPeriod가 변경될 때마다 통계 데이터를 다시 로드
watch([selectedRole, selectedPeriod], () => {
  loadStatistics();
});

onMounted(() => {
  loadStatistics(); // 컴포넌트 마운트 시 초기 통계 로드
});
</script>

<template>
  <div class="min-h-screen bg-[#111111] p-6 text-white">
    <h1 class="mb-6 text-3xl font-bold">회원 통계</h1>

    <!-- 역할 선택 버튼 -->
    <div class="mb-4 flex space-x-2">
      <BaseButton
        @click="selectRole('ALL')"
        :class="{
          'bg-yellow-500': selectedRole === 'ALL',
          'bg-gray-700': selectedRole !== 'ALL',
        }"
        class="rounded-md px-4 py-2 text-white"
        >전체</BaseButton
      >
      <BaseButton
        @click="selectRole('TRAINER')"
        :class="{
          'bg-yellow-500': selectedRole === 'TRAINER',
          'bg-gray-700': selectedRole !== 'TRAINER',
        }"
        class="rounded-md px-4 py-2 text-white"
        >트레이너</BaseButton
      >
      <BaseButton
        @click="selectRole('TRAINEE')"
        :class="{
          'bg-yellow-500': selectedRole === 'TRAINEE',
          'bg-gray-700': selectedRole !== 'TRAINEE',
        }"
        class="rounded-md px-4 py-2 text-white"
        >회원</BaseButton
      >
    </div>

    <!-- 기간 선택 버튼 -->
    <div class="mb-6 flex space-x-2">
      <BaseButton
        @click="selectPeriod('daily')"
        :class="{
          'bg-yellow-500': selectedPeriod === 'daily',
          'bg-gray-700': selectedPeriod !== 'daily',
        }"
        class="rounded-md px-4 py-2 text-white"
        >일별</BaseButton
      >
      <BaseButton
        @click="selectPeriod('weekly')"
        :class="{
          'bg-yellow-500': selectedPeriod === 'weekly',
          'bg-gray-700': selectedPeriod !== 'weekly',
        }"
        class="rounded-md px-4 py-2 text-white"
        >주별</BaseButton
      >
      <BaseButton
        @click="selectPeriod('monthly')"
        :class="{
          'bg-yellow-500': selectedPeriod === 'monthly',
          'bg-gray-700': selectedPeriod !== 'monthly',
        }"
        class="rounded-md px-4 py-2 text-white"
        >월별</BaseButton
      >
      <BaseButton
        @click="selectPeriod('yearly')"
        :class="{
          'bg-yellow-500': selectedPeriod === 'yearly',
          'bg-gray-700': selectedPeriod !== 'yearly',
        }"
        class="rounded-md px-4 py-2 text-white"
        >년별</BaseButton
      >
    </div>

    <div class="mx-auto mb-6 max-w-5xl rounded-xl bg-white p-4 shadow">
      <h2 class="mb-2 text-xl font-semibold text-black">요약 통계</h2>
      <div class="text-gray-400">
        <p class="text-black">오늘 증가한 회원 수: {{ todayNewUsers }}명</p>
        <p class="text-black">총 회원 수: {{ totalUsers }}명</p>
      </div>
    </div>

    <div class="mx-auto max-w-5xl rounded-xl bg-white p-4 shadow">
      <h2 class="mb-2 text-xl font-semibold text-black">
        기간별 가입 통계 ({{
          selectedPeriod === "daily"
            ? "일별"
            : selectedPeriod === "weekly"
              ? "주별"
              : selectedPeriod === "monthly"
                ? "월별"
                : "년별"
        }})
      </h2>
      <div class="h-80">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 필요 시 추가적인 커스텀 스타일 */
</style>
