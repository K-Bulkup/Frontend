<template>
  <div class="mx-auto w-full max-w-[420px] overflow-y-auto px-4 pb-24 pt-2">
    <div
      class="relative mb-4 flex h-[101px] w-full items-center justify-between"
    >
      <img :src="logo" alt="KBULKUP" class="h-[87px] w-[87px]" />
    </div>
    <!-- 트레이닝 선택 -->
    <div class="relative w-full">
      <div class="mb-4 flex items-center justify-between">
        <label class="text-input"> 트레이너 수익 관리 </label>
        <div class="flex space-x-2">
          <input
            type="radio"
            id="total"
            value="total"
            v-model="displayMode"
            class="hidden"
          />
          <label
            for="total"
            class="flex h-[37px] cursor-pointer items-center justify-center rounded-full border px-4 text-xs transition-colors"
            :class="{
              'border-primary bg-primary/20': displayMode === 'total',
              'border-gray-600 text-gray-300 hover:border-primary hover:bg-primary/20':
                displayMode !== 'total',
            }"
          >
            총 누적
          </label>
          <input
            type="radio"
            id="last30"
            value="last30"
            v-model="displayMode"
            class="hidden"
          />
          <label
            for="last30"
            class="flex h-[37px] cursor-pointer items-center justify-center rounded-full border px-4 text-xs transition-colors"
            :class="{
              'border-primary bg-primary/20': displayMode === 'last30',
              'border-gray-600 text-gray-300 hover:border-primary hover:bg-primary/20':
                displayMode !== 'last30',
            }"
          >
            최근 30일
          </label>
        </div>
      </div>

      <!-- 현재 선택된 항목 표시 (항상 표시) -->
      <div class="rounded-xl bg-gray-900 p-4 shadow-lg">
        <button
          @click="toggleExpanded"
          class="flex w-full items-center justify-between text-left focus:outline-none"
        >
          <span class="text-input text-white">{{ selectedOptionDisplay }}</span>
          <svg
            class="h-6 w-6 text-gray-300 transition-transform duration-200"
            :class="{ 'rotate-180': isExpanded }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <!-- Dropdown overlay when expanded -->
      <div
        v-if="isExpanded"
        class="absolute left-0 right-0 z-10 mt-1 w-full space-y-1 rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-xl"
        role="menu"
        aria-label="트레이닝 선택"
      >
        <!-- 옵션 리스트 -->
        <button
          v-for="option in dropdownOptions"
          :key="option.value"
          @click="selectOption(option)"
          class="text-subtext flex w-full items-center justify-center rounded-lg p-3 transition-all"
          :class="[
            selectedSourceKey === option.value
              ? 'bg-primary text-white shadow-[0_0_0_1px_rgba(34,228,129,0.6)]'
              : 'bg-gray-800 text-gray-300 hover:bg-primary/20 hover:text-white hover:shadow-[0_0_0_1px_rgba(34,228,129,0.6)]',
          ]"
          role="menuitemradio"
          :aria-checked="selectedSourceKey === option.value"
        >
          {{ option.display }}
        </button>
      </div>
    </div>
    <!-- 매출액 요약 -->
    <div v-if="displayMode === 'total'">
      <div class="mt-6 rounded-xl bg-gray-900 p-4 shadow-lg">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <img
              src="@/assets/images/purse.png"
              alt="purse"
              class="h-10 w-10"
            />
            <div>
              <p class="text-body text-gray-300">총 누적 매출</p>
              <p class="text-subTitle font-bold text-white">
                {{ formatCurrency(totalRevenue) }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center space-x-3">
          <img
            src="@/assets/images/receipt.png"
            alt="receipt"
            class="h-10 w-10"
          />
          <div>
            <p class="text-caption text-gray-300">총 누적 수익</p>
            <p class="text-subTitle font-bold text-white">
              {{ formatCurrency(totalRevenue * 0.9) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 총 누적 매출액 차트 -->
      <div
        class="mx-auto mt-6 h-64 w-full rounded-lg bg-gray-900 p-4 shadow-md"
      >
        <LineChart
          :chart-data="cumulativeChartData"
          :chart-options="chartOptions"
        />
      </div>
    </div>

    <div v-if="displayMode === 'last30'">
      <!-- 경계선-->
      <div class="mt-6 rounded-xl bg-gray-900 p-4 shadow-lg">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <img
              src="@/assets/images/purse.png"
              alt="purse"
              class="h-10 w-10"
            />
            <div>
              <p class="text-body text-gray-300">최근 30일 누적 매출</p>
              <p class="text-subTitle font-bold text-white">
                {{ formatCurrency(last30DaysRevenue) }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center space-x-3">
          <img
            src="@/assets/images/receipt.png"
            alt="receipt"
            class="h-10 w-10"
          />
          <div>
            <p class="text-caption text-gray-300">최근 30일 누적 수익</p>
            <p class="text-subTitle font-bold text-white">
              {{ formatCurrency(last30DaysRevenue * 0.9) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 최근 30일 매출액 차트 -->
      <div
        class="mx-auto mt-6 h-64 w-full rounded-lg bg-gray-900 p-4 shadow-md"
      >
        <LineChart
          :chart-data="last30ChartData"
          :chart-options="chartOptions"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import logo from "@/assets/images/mascot/logo.png";
import LineChart from "@/components/common/LineChart.vue";
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
const displayMode = ref("total");

// Dropdown state
const isExpanded = ref(false);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const selectOption = (option) => {
  selectedSourceKey.value = option.value;
  isExpanded.value = false;
};

const selectedOptionDisplay = computed(() => {
  const selected = dropdownOptions.value.find(
    (opt) => opt.value === selectedSourceKey.value,
  );
  return selected ? selected.display : "트레이닝을 선택해주세요";
});

const dropdownOptions = computed(() => {
  const options = [{ value: "overall", display: "전체 트레이닝" }];
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
