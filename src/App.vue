<script setup>
import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
</script>

<template>
  <div class="app-container">
    <div class="mx-auto max-w-screen-md px-4">
      <Header />
      <RouterView />
      <Footer />
    </div>
  </div>
</template>

<style>
/* 전체 페이지 배경색 */
body {
  background-color: #e5e7eb; /* 밝은 회색으로 앱 영역과 구분 */
}

.app-container {
  /* 디자인 기준 크기로 고정 */
  width: 393px;
  height: 852px;

  /* 더 큰 화면에서 중앙 정렬 */
  position: relative;
  margin: 0 auto; /* 상하 마진 없이 좌우 자동 조정으로 중앙 정렬 */

  /* 앱 기본 배경색 및 텍스트 색상 */
  background-color: #090909; /* realBlack */
  color: #ffffff; /* white */

  /* 내용이 넘칠 경우 숨김 처리 */
  overflow: hidden;

  /* 그림자 효과 (선택 사항) */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}
</style>
