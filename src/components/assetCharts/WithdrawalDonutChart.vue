<script setup>
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

// Props로 transactions 받기
const props = defineProps({
  transactions: Array,
});

// 카테고리 리스트 정의 (순서 고정)
const categories = [
  "식비",
  "교통비",
  "주거/공과금",
  "생필품",
  "의료/건강",
  "패션/미용",
  "문화생활/여가",
  "기타",
];

// 카테고리별 색상 정의 (Tailwind 색 계열 응용)
const colors = [
  "#F87171", // 식비 - red-400
  "#60A5FA", // 교통비 - blue-400
  "#FCD34D", // 주거/공과금 - yellow-300
  "#34D399", // 생필품 - green-400
  "#A78BFA", // 의료/건강 - purple-400
  "#F9A8D4", // 패션/미용 - pink-400
  "#38BDF8", // 문화생활/여가 - sky-400
  "#D1D5DB", // 기타 - gray-300
];

// 도넛 차트 데이터 구성
const chartData = computed(() => {
  const categoryTotals = Object.fromEntries(categories.map((c) => [c, 0]));

  props.transactions
    .filter((t) => t.transactionType === "출금")
    .forEach((t) => {
      if (categoryTotals[t.transactionCategory] !== undefined) {
        categoryTotals[t.transactionCategory] += t.amount;
      }
    });

  return {
    labels: categories,
    datasets: [
      {
        data: categories.map((c) => categoryTotals[c]),
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };
});

// 옵션 정의
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context) {
          const label = context.label || "";
          const value = context.raw || 0;
          return `${label}: ₩${value.toLocaleString()}`;
        },
      },
    },
    datalabels: {
      display: false, // 차트 위 라벨은 숨기기
    },
  },
};
</script>
<template>
  <div>
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>
