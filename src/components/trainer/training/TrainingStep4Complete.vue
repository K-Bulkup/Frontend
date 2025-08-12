<script setup>
import ConnectSuccessModal from "@/components/common/ConnectSuccessModal.vue";

const emit = defineEmits(["confirm"]);

const handleModalClose = () => {
  emit("confirm");
};
</script>

<template>
  <div>
    <ConnectSuccessModal
      title="트레이닝이 오픈되었습니다"
      subtitle="관리자의 승인을 기다려주세요 !"
      confirm-button-text="확인"
      @close="handleModalClose"
    />
  </div>
</template>
