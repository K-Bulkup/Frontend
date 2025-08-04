<script setup>
import { ref, watch } from "vue";
import TrainerInfo from "@/components/trainer/mypage/TrainerInfo.vue";
const trainerInfoRef = ref(null);

const userInfo = ref({
  username: "사용자", // 기본값
});

watch(
  () => trainerInfoRef.value?.trainerData?.username,
  (newUsername) => {
    if (newUsername) {
      userInfo.value.username = newUsername;
      console.log("userInfo.username 업데이트됨:", userInfo.value.username);
    }
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <div class="bg-gradient-to-br px-10 pt-10">
    <div class="flex items-center gap-6">
      <!-- 인사말 텍스트 -->
      <div class="flex-1 text-white">
        <div class="text-display font-bold leading-tight">
          {{ userInfo?.username || "트레이너" }}님,
        </div>
        <div class="text-display font-bold leading-tight">반갑습니다</div>
        <div class="mt-2 flex items-center gap-2 text-[18px] text-blue-200">
          오늘도 금육이의 체력을 키워주세요 !
        </div>
      </div>
    </div>
    <TrainerInfo ref="trainerInfoRef" style="display: none" />
  </div>
</template>
