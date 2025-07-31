<script setup>
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

// Props로 composition 객체 받기
const props = defineProps({
  composition: Object,
});

// 도넛 차트 데이터 구성
const chartData = computed(() => {
  if (!props.composition || !props.composition.assetComposition) return null;

  const comp = props.composition.assetComposition;

  return {
    labels: Object.keys(comp),
    datasets: [
      {
        data: Object.values(comp),
        backgroundColor: [
          "#FBE081", // 기타
          "#3B82F6", // 주식
          "#10B981", // 채권
          "#F87171", // 펀드
          "#A78BFA", // 현금 및 예금
        ],
        borderWidth: 1,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || "";
          const value = context.raw;
          return `${label}: ${value.toFixed(1)}%`;
        },
      },
    },
    title: {
      display: false,
    },
    datalabels: {
      color: "#383838", // Tailwind gray-700
      anchor: "center",
      align: "center",
      font: {
        weight: "bold",
        size: 12,
      },
      formatter: (value, context) => {
        const data = context.chart.data.datasets[0].data;
        const total = data.reduce((sum, val) => sum + val, 0);
        const percentage = ((value / total) * 100).toFixed(1);
        return `${percentage}%`;
      },

      display: true,
    },
  },
};
</script>
<template>
  <div>
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>
