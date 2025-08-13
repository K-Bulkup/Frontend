<script setup>
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
});

// 카테고리 + 색상 (표기 기준은 슬래시)
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

const colors = [
  "#FFCBCB", // 식비
  "#A0E7E5", // 교통비
  "#FFFACD", // 주거/공과금
  "#C4F1BE", // 생필품
  "#D9CFFF", // 의료/건강
  "#FFD6EC", // 패션/미용
  "#C7CEEA", // 문화생활/여가
  "#E5E5E5", // 기타
];

// 언더스코어 → 슬래시 정규화
const normalizeCategory = (s) => (s ? s.replaceAll("_", "/") : "기타");

// ✅ 차트 데이터
const chartData = computed(() => {
  // 카테고리별 합계 초기화
  const categoryTotals = Object.fromEntries(categories.map((c) => [c, 0]));

  props.transactions
    .filter((t) => t.transactionType === "출금")
    .forEach((t) => {
      const keyRaw = normalizeCategory(t.transactionCategory);
      const key = categories.includes(keyRaw) ? keyRaw : "기타";
      categoryTotals[key] += Number(t.amount) || 0;
    });

  const values = categories.map((c) => categoryTotals[c]);

  // ✅ 모두 0이면 기본 회색 차트
  if (values.every((v) => v === 0)) {
    return {
      labels: ["데이터 없음"],
      datasets: [
        {
          data: [100],
          backgroundColor: ["#595959"],
          borderWidth: 1,
        },
      ],
    };
  }

  return {
    labels: categories,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };
});

// ✅ 옵션
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#FFFFFF" },
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (ctx) => {
          const label = ctx.label || "";
          const value = Number(ctx.raw || 0);
          const data = ctx.dataset.data;
          const isDummy = data.length === 1 && value === 100;
          if (isDummy) return null;
          return `${label}: ₩${value.toLocaleString()}`; // ← 툴팁은 금액 유지
        },
      },
    },
    datalabels: {
      display: true,
      color: "#595959", // 기존 색 유지
      font: { weight: "bold", size: 12 },
      formatter: (value, context) => {
        const data = context.chart.data.datasets[0].data;
        const total = data.reduce((s, v) => s + v, 0);
        const isDummy = data.length === 1 && value === 100;
        if (!total || !value || isDummy) return null;

        const pct = (value / total) * 100;
        return `${pct.toFixed(1)}%`; // ← 퍼센트 표기
        // 작게 보이는 조각 숨기고 싶으면:
        // return pct >= 3 ? `${pct.toFixed(1)}%` : null;
      },
    },
  },
};
</script>

<template>
  <div>
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>
