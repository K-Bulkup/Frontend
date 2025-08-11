<template>
  <div class="min-h-screen bg-white p-6 text-black">
    <h1 class="mb-6 text-3xl font-bold">회원 통계</h1>

    <div class="mx-auto max-w-6xl space-y-6">
      <!-- 역할 선택 버튼 -->
      <div class="flex space-x-2">
        <BaseButton
          v-for="role in [
            { key: 'ALL', label: '전체' },
            { key: 'TRAINER', label: '트레이너' },
            { key: 'TRAINEE', label: '회원' },
          ]"
          :key="role.key"
          @click="selectRole(role.key)"
          class="rounded-md px-4 py-2 text-sm font-bold transition-colors"
          :class="
            selectedRole === role.key
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-200 text-black hover:bg-gray-300'
          "
        >
          {{ role.label }}
        </BaseButton>
      </div>

      <!-- 기간 선택 버튼 -->
      <div class="flex space-x-2">
        <BaseButton
          v-for="period in [
            { key: 'daily', label: '일별' },
            { key: 'weekly', label: '주별' },
            { key: 'monthly', label: '월별' },
            { key: 'yearly', label: '년별' },
          ]"
          :key="period.key"
          @click="selectPeriod(period.key)"
          class="rounded-md px-4 py-2 text-sm font-bold transition-colors"
          :class="
            selectedPeriod === period.key
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-200 text-black hover:bg-gray-300'
          "
        >
          {{ period.label }}
        </BaseButton>
      </div>

      <!-- 요약 통계 -->
      <div class="rounded-xl bg-white p-4 shadow">
        <h2 class="mb-2 text-xl font-semibold">요약 통계</h2>
        <div class="text-gray-600">
          <p>
            오늘 증가한 회원 수:
            <span class="font-bold text-black">{{ todayNewUsers }}</span
            >명
          </p>
          <p>
            총 회원 수:
            <span class="font-bold text-black">{{ totalUsers }}</span
            >명
          </p>
        </div>
      </div>

      <!-- 가입 통계 차트 -->
      <div class="rounded-xl bg-white p-4 shadow">
        <h2 class="mb-2 text-xl font-semibold">
          기간별 가입 통계 ({{ periodLabel }})
        </h2>
        <div class="h-80">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useAdminUserApi } from "@/composables/api/useAdminUserApi";
import { Line } from "vue-chartjs";
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

const selectedRole = ref("ALL");
const selectedPeriod = ref("daily");

const todayNewUsers = ref(0);
const totalUsers = ref(0);
const statisticsData = ref([]);

const periodLabel = computed(() =>
  selectedPeriod.value === "daily"
    ? "일별"
    : selectedPeriod.value === "weekly"
      ? "주별"
      : selectedPeriod.value === "monthly"
        ? "월별"
        : "년별",
);

const chartData = computed(() => {
  const labels = statisticsData.value.map((stat) => stat.dateLabel);
  const data = statisticsData.value.map((stat) => stat.signupCount);
  return {
    labels,
    datasets: [
      {
        label: "가입자 수",
        backgroundColor: "#f87979",
        borderColor: "#f87979",
        data,
        tension: 0.4,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { title: { display: true, text: "기간" } },
    y: { title: { display: true, text: "가입자 수" }, beginAtZero: true },
  },
};

const loadStatistics = async () => {
  try {
    const dailyStats = await getUserSignupsStatistics(
      "daily",
      selectedRole.value === "ALL" ? null : selectedRole.value,
    );
    const todayLabel = new Date().toISOString().slice(0, 10);
    const todayData = dailyStats.find((stat) => stat.dateLabel === todayLabel);
    todayNewUsers.value = todayData ? todayData.signupCount : 0;

    const totalStats = await getUserSignupsStatistics(
      "all_time",
      selectedRole.value === "ALL" ? null : selectedRole.value,
    );
    totalUsers.value = totalStats.length > 0 ? totalStats[0].signupCount : 0;

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

watch([selectedRole, selectedPeriod], loadStatistics);
onMounted(loadStatistics);
</script>
