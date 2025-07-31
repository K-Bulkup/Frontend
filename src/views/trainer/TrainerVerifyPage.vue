<script setup>
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import CertificatesInfo from "@/components/trainer/certificates/CertificatesInfo.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const handleBack = () => {
  router.go(-1); // 이전 페이지로 이동
};
</script>

<template>
  <BaseHeader title="자격증 검증" @back="handleBack" />

  <!-- 페이지 설명 -->
  <BaseStatusMessage
    title="자격 정보를 입력해주세요"
    subtitle="합격증 번호와 발급 번호를 입력해주세요."
  />

  <CertificatesInfo />
</template>
