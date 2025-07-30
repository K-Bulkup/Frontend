<script setup>
import { ref, onMounted, watch } from "vue"; // watch 임포트
import TrainerInfo from "@/components/trainer/mypage/TrainerInfo.vue";

const trainerInfoRef = ref(null);

const userInfo = ref({
  username: "사용자", // 기본값
});

// TrainerInfo 컴포넌트의 trainerData 변경을 감지하는 watch 추가
watch(
  () => trainerInfoRef.value?.trainerData?.username,
  (newUsername) => {
    if (newUsername) {
      userInfo.value.username = newUsername;
      console.log("userInfo.username 업데이트됨:", userInfo.value.username);
    } else {
      // username이 여전히 null/undefined일 경우 경고 또는 기본값 유지
      console.warn("TrainerInfo에서 유효한 username을 가져오지 못했습니다.");
    }
  },
  { immediate: true, deep: true }, // immediate: 컴포넌트 초기화 시 즉시 실행, deep: 객체 내부 변경 감지
);

onMounted(() => {
  // 컴포넌트가 마운트될 때 TrainerInfoRef가 설정되면 바로 watch가 동작할 수 있도록 합니다.
  // 여기서는 fetchTrainerInfo를 직접 다시 호출하지 않습니다.
  // TrainerInfo 컴포넌트 자체의 onMounted에서 이미 fetchTrainerInfo가 호출될 것이기 때문입니다.
  // 만약 TrainerInfo 컴포넌트의 onMounted에서 fetchTrainerInfo가 호출되지 않는다면
  // 여기서 trainerInfoRef.value.fetchTrainerInfo()를 호출해야 합니다.
  // 하지만 현재 시나리오에서는 중복 호출로 인한 혼란을 피하기 위해 제거합니다.
});
</script>

<template>
  <div class="px-10 pt-3">
    <div class="flex items-center justify-between">
      <div class="text-white">
        <div class="text-display font-bold">
          {{ userInfo?.username || "사용자" }}님,
        </div>
        <div class="text-[32px] font-bold">반갑습니다</div>
      </div>
    </div>
    <TrainerInfo ref="trainerInfoRef" style="display: none" />
  </div>
</template>
