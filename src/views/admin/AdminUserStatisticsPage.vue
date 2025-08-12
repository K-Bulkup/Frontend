<template>
  <div class="bg-realblack min-h-screen p-6 text-white">
    <h1 class="mb-6 text-3xl font-bold">회원 통계</h1>

    <div class="mx-auto max-w-6xl space-y-6">
      <div class="flex max-w-md space-x-4">
        <BaseDropdown
          label="역할 선택"
          v-model="selectedRole"
          :options="[
            { key: 'ALL', label: '전체' },
            { key: 'TRAINER', label: '트레이너' },
            { key: 'TRAINEE', label: '회원' },
          ]"
          displayKey="label"
          valueKey="key"
          class="flex-1"
        />

        <BaseDropdown
          label="기간 선택"
          v-model="selectedPeriod"
          :options="[
            { key: 'daily', label: '일별' },
            { key: 'weekly', label: '주별' },
            { key: 'monthly', label: '월별' },
            { key: 'yearly', label: '년별' },
          ]"
          displayKey="label"
          valueKey="key"
          class="flex-1"
        />
      </div>
      <!-- 요약 통계 -->
      <div class="rounded-xl bg-gray-800 p-4 shadow">
        <h2 class="mb-2 text-xl font-semibold">요약 통계</h2>
        <div>
          <p>
            오늘 증가한 회원 수:
            <span class="font-bold text-white">{{ todayNewUsers }}</span
            >명
          </p>
          <p>
            총 회원 수:
            <span class="font-bold text-white">{{ totalUsers }}</span
            >명
          </p>
        </div>
      </div>

      <!-- 가입 통계 차트 -->
      <div class="rounded-xl bg-gray-800 p-4 shadow">
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
import BaseButton from "@/components/admin/AdminBaseButton.vue";
import BaseDropdown from "@/components/common/BaseDropdown.vue";
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
        backgroundColor: "#22e481",
        borderColor: "#22e481",
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

watch([selectedRole, selectedPeriod], loadStatistics);
onMounted(loadStatistics);
</script>
