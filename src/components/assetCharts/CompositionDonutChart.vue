<script setup>
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

// Props로 composition 객체 받기
const props = defineProps({
  composition: Object,
  balance: Number,
});

// 도넛 차트 데이터 구성
const chartData = computed(() => {
  const defaultData = {
    labels: ["데이터 없음"],
    datasets: [
      {
        data: [100],
        backgroundColor: ["#595959"], // Tailwind gray-200
        borderWidth: 1,
      },
    ],
  };

  if (!props.composition || !props.composition.assetComposition) {
    return defaultData;
  }

  const comp = props.composition.assetComposition;
  const labels = Object.keys(comp);
  const values = Object.values(comp);

  // 값이 모두 0이거나 데이터가 없는 경우 → 기본 차트
  if (!values.length || values.every((v) => v === 0)) {
    return defaultData;
  }

  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#FFF3B0", // 기타
          "#A0D8EF", // 주식
          "#B2E2B8", // 채권
          "#FFC4C4", // 펀드
          "#D8C7FF", // 현금 및 예금
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
          const data = context.dataset.data;
          const total = data.reduce((sum, val) => sum + val, 0);
          const isDummy = data.length === 1 && value === 100;
          if (isDummy) return null;

          const totalBalance = props.balance || 0;
          const percentage = ((value / total) * 100).toFixed(1);
          const amount = Math.round((value / 100) * totalBalance);

          return `${label}: ${percentage}% (${amount.toLocaleString()}원)`;
        },
      },
    },

    title: {
      display: false,
    },
    datalabels: {
      color: "#595959",
      anchor: "center",
      align: "center",
      font: {
        weight: "bold",
        size: 12,
      },
      formatter: (value, context) => {
        const data = context.chart.data.datasets[0].data;
        const total = data.reduce((sum, val) => sum + val, 0);
        if (!total || value === 100) return ""; // 기본 차트일 땐 라벨 안 보여줌
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
