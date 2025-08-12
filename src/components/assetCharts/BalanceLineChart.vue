<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
);

const props = defineProps({
  assetData: { type: Object, required: true },
});

// 날짜 [y,m,d] → YYYY.MM 라벨
const monthLabel = (arr) => {
  const [y, m] = arr;
  return `${y}.${String(m).padStart(2, "0")}`;
};

const chartData = computed(() => {
  const snaps = props.assetData?.snapshots ?? [];
  const labels = [...snaps].map((s) => monthLabel(s.snapshotDate)).reverse(); // YYYY.MM
  const balances = [...snaps].map((s) => s.balance).reverse();

  return {
    labels,
    datasets: [
      {
        label: "잔액 추이",
        data: balances,
        borderColor: "#22E481", // 메인 컬러
        backgroundColor: "rgba(34,228,129,0.12)", // 연한 채움
        fill: true,
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#22E481",
        pointBorderColor: "#111827",
        tension: 0.2,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: false },
    title: { display: false },
    // ⚠️ datalabels 플러그인 미사용(값 표기 없음)
    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255,255,255,0.2)",
      borderWidth: 1,
      callbacks: {
        // 필요하면 툴팁 라벨 유지
        label: (ctx) =>
          ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}원`,
      },
    },
    datalabels: { display: false },
  },
  scales: {
    x: {
      ticks: {
        color: "#E5E7EB",
        autoSkip: true,
        maxTicksLimit: 6, // 월 라벨이므로 간격 줄임
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
        stepSize: 2_000_000,
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
</script>

<template>
  <div class="h-64">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
