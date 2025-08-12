<template>
  <div class="min-h-screen p-4">
    <BaseHeader title="수익 관리" @back="router.back()" />

    <!-- 매출액 요약 -->
    <div class="mt-4 flex justify-around text-center">
      <div>
        <p class="text-sm">총 누적 매출액</p>
        <p class="text-2xl font-bold">{{ formatCurrency(totalRevenue) }}</p>
      </div>
      <div>
        <p class="text-sm">최근 30일 매출액</p>
        <p class="text-2xl font-bold">
          {{ formatCurrency(last30DaysRevenue) }}
        </p>
      </div>
    </div>

    <!-- 트레이닝 선택 -->
    <div class="mt-6">
      <BaseDropdown
        v-model="selectedSourceKey"
        label="트레이닝 선택"
        placeholder="트레이닝을 선택해주세요"
        :options="dropdownOptions"
        displayKey="display"
        valueKey="value"
      />
    </div>

    <!-- 총 누적 매출액 차트 -->
    <div
      class="mx-auto mt-6 h-64 w-[326px] rounded-lg border border-gray-300 bg-gray-900 p-4 shadow-md"
    >
      <LineChart
        :chart-data="cumulativeChartData"
        :chart-options="chartOptions"
      />
    </div>

    <!-- 최근 30일 매출액 차트 -->
    <div
      class="mx-auto mt-4 h-64 w-[326px] rounded-lg border border-gray-300 bg-gray-900 p-4 shadow-md"
    >
      <LineChart :chart-data="last30ChartData" :chart-options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import BaseHeader from "@/components/common/BaseHeader.vue";
import LineChart from "@/components/common/LineChart.vue";
import BaseDropdown from "@/components/common/BaseDropdown.vue";
import {
  getRevenueReport,
  getDailyRevenue,
  getTrainingDailyRevenue,
} from "@/composables/api/useTrainerMypageApi.js";

const router = useRouter();

const summaryData = ref(null);
const selectedSourceKey = ref("overall");
const totalRevenue = ref(0);
const last30DaysRevenue = ref(0);
const dailyRevenueData = ref([]);

const dropdownOptions = computed(() => {
  const options = [{ value: "overall", display: "전체" }];
  if (summaryData.value && summaryData.value.trainingRevenues) {
    summaryData.value.trainingRevenues.forEach((training) => {
      options.push({
        value: String(training.trainingId),
        display: training.trainingTitle,
      });
    });
  }
  return options;
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255,255,255,0.2)",
      borderWidth: 1,
      callbacks: {
        label: (ctx) =>
          ` ${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString()}원`,
      },
    },
    datalabels: { display: false },
  },
  scales: {
    x: {
      ticks: {
        color: "#E5E7EB",
        autoSkip: true,
        maxTicksLimit: 6,
        maxRotation: 0,
      },
      grid: {
        color: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.2)",
      },
    },
    y: {
      ticks: {
        color: "#E5E7EB",
        stepSize: 2_000_000, // Adjusted for revenue scale, can be refined
        callback: (v) => Number(v).toLocaleString(),
      },
      grid: {
        color: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.2)",
      },
      beginAtZero: false,
    },
  },
};

const formatCurrency = (val) => {
  if (val == null) return "0원";
  return Number(val).toLocaleString("ko-KR") + "원";
};

const cumulativeChartData = computed(() => {
  const labels = dailyRevenueData.value.map((d) => d.date.slice(5));
  let cumulative = 0;
  const data = dailyRevenueData.value.map((d) => {
    cumulative += d.revenue;
    return cumulative;
  });
  return {
    labels,
    datasets: [
      {
        label: "총 누적 매출액",
        data,
        borderColor: "#22E481",
        backgroundColor: "rgba(34,228,129,0.12)",
        fill: true, // Changed to true for area fill
        tension: 0.2, // Changed tension
        pointRadius: 3, // Changed point radius
        pointHoverRadius: 5, // Added hover radius
        pointBackgroundColor: "#22E481",
        pointBorderColor: "#111827", // Changed point border color
      },
    ],
  };
});

const last30ChartData = computed(() => {
  const last30 = dailyRevenueData.value.slice(-30);
  const labels = last30.map((d) => d.date.slice(5));
  const data = last30.map((d) => d.revenue);
  return {
    labels,
    datasets: [
      {
        label: "최근 30일 매출액",
        data,
        borderColor: "#22E481",
        backgroundColor: "rgba(34,228,129,0.12)",
        fill: true, // Changed to true for area fill
        tension: 0.2, // Changed tension
        pointRadius: 3, // Changed point radius
        pointHoverRadius: 5, // Added hover radius
        pointBackgroundColor: "#22E481",
        pointBorderColor: "#111827", // Changed point border color
      },
    ],
  };
});

const fetchData = async () => {
  if (selectedSourceKey.value === "overall") {
    // 전체 요약
    summaryData.value = await getRevenueReport();
    totalRevenue.value = summaryData.value.totalAccumulatedRevenue;
    last30DaysRevenue.value = summaryData.value.last30DaysAccumulatedRevenue;
    dailyRevenueData.value = await getDailyRevenue();
  } else {
    // 특정 트레이닝 요약
    dailyRevenueData.value = await getTrainingDailyRevenue(
      selectedSourceKey.value,
    );
    totalRevenue.value = dailyRevenueData.value.reduce(
      (sum, d) => sum + d.revenue,
      0,
    );
    last30DaysRevenue.value = dailyRevenueData.value
      .slice(-30)
      .reduce((sum, d) => sum + d.revenue, 0);
  }
};

watch(selectedSourceKey, fetchData);

onMounted(fetchData);
</script>
