<script setup>
import { useRouter } from "vue-router";
import BaseBadge from "@/components/common/BaseBadge.vue"; // BaseBadge 컴포넌트 경로

const router = useRouter();

const goToTrainingInput = () => {
  router.push("/trainer/training/input");
};
</script>
<template>
  <div>
    <div class="mt-6 flex justify-end">
      <BaseBadge
        variant="primary"
        class="cursor-pointer"
        @click="goToTrainingInput"
      >
        트레이닝 오픈
      </BaseBadge>
    </div>
  </div>
</template>
