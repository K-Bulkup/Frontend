<script setup>
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import BaseButton from "@/components/common/BaseButton.vue";

const emit = defineEmits(["confirm"]);
</script>

<template>
  <div class="flex flex-1 flex-col items-center pt-48">
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full">
      <img src="@/assets/images/check-mark.svg" alt="체크마크" />
    </div>

    <BaseStatusMessage
      title="등록이 완료되었습니다"
      subtitle="트레이닝이 오픈되었습니다!"
    />

    <div class="mt-8 w-full">
      <BaseButton @click="emit('confirm')">확인</BaseButton>
    </div>
  </div>
</template>
