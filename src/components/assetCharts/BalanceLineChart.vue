<script setup>
import { computed, watch } from "vue";
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
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
);

// Props로 assetData를 받아옵니다.
const props = defineProps({
  assetData: Object,
});

// 날짜와 balance 데이터를 추출해서 chart.js 형식으로 변환
const chartData = computed(() => {
  if (!props.assetData || !props.assetData.snapshots) return null;

  const labels = props.assetData.snapshots
    .map((s) => new Date(s.snapshotDate).toLocaleDateString())
    .reverse(); // 최신순 정렬

  const balances = props.assetData.snapshots.map((s) => s.balance).reverse(); // 최신순 정렬

  return {
    labels,
    datasets: [
      {
        label: "잔액 추이",
        data: balances,
        fill: false,
        borderColor: "#FBE081",
        tension: 0.1,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    datalabels: {
      display: false,
    },
    legend: {
      display: false,
      position: "top",
    },
    title: {
      display: false,
      text: "일자별 잔액 추이",
    },
  },
  scales: {
    y: {
      ticks: {
        stepSize: 1_000_000,
        callback: function (value) {
          return value.toLocaleString(); // 세 자리 콤마로 포맷
        },
      },
      beginAtZero: false,
    },
  },
};
</script>
<template>
  <div>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
