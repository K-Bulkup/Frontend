<script setup>
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { computed } from "vue";

ChartJS.register(ArcElement, Tooltip);

// props
const props = defineProps({
  progress: {
    type: Number,
    required: true,
  },
});

// 반응형 차트 데이터
const chartData = computed(() => ({
  datasets: [
    {
      data: [props.progress, 100 - props.progress],
      backgroundColor: ["#FBE081", "#E5E7EB"],
      borderWidth: 0,
    },
  ],
}));

// 차트 옵션
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "80%",
  plugins: {
    tooltip: {
      enabled: false,
    },
  },
  animation: {
    duration: 1000,
  },
};
</script>

<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>
