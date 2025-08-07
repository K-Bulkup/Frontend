<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "@/components/common/BaseButton.vue";

const router = useRouter();
const items = ref([]);
const page = ref(1);

const loadMoreItems = () => {
  // 실제 데이터 로딩 로직 구현 예정
  page.value++;
};

const onScroll = () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.body.offsetHeight;

  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMoreItems();
  }
};

onMounted(() => {
  window.addEventListener("scroll", onScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div class="min-h-screen bg-[#111111] p-6 text-white">
    <h1 class="mb-6 text-3xl font-bold">관리자 대시보드</h1>

    <!-- 상단 통계 그래프 2분할 -->
    <div class="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
      <div class="h-[200px] rounded-xl bg-white p-4 shadow">
        <h2 class="mb-2 text-xl font-semibold text-black">회원 수 통계</h2>
        <div class="text-gray-400">통계 버튼을 눌러 확인하세요.</div>
        <BaseButton
          @click="router.push('/admin/user-statistics')"
          class="rounded0 mt-2 bg-black py-2 text-sm font-bold text-white"
        >
          회원 통계
        </BaseButton>
      </div>
      <div class="h-[200px] rounded-xl bg-white p-4 text-black shadow">
        <h2 class="mb-2 text-xl font-semibold">매출 통계</h2>
        <div class="text-gray-400">그래프 또는 차트 컴포넌트 자리</div>
      </div>
    </div>

    <!-- 하단 사분할 (2x2 고정) -->
    <div class="mx-auto grid max-w-5xl grid-cols-2 gap-6">
      <div
        class="flex aspect-square flex-col justify-between rounded-xl bg-white p-5 shadow"
      >
        <div>
          <h2 class="mb-2 text-2xl font-semibold text-black">강좌</h2>
          <p class="mb-4 text-gray-400">강좌 승인/반려</p>
        </div>
        <BaseButton
          @click="router.push('/admin/training-approval')"
          class="rounded0 bg-black py-2 text-sm font-bold text-white"
        >
          이동하기
        </BaseButton>
      </div>

      <div
        class="flex aspect-square flex-col justify-between rounded-xl bg-white p-5 shadow"
      >
        <div>
          <h2 class="mb-2 text-2xl font-semibold text-black">회원</h2>
          <p class="mb-4 text-gray-400">회원 등록 및 삭제</p>
        </div>
        <BaseButton
          @click="router.push('/admin/user-management')"
          class="rounded0 bg-black py-2 text-sm font-bold text-white"
        >
          회원 관리
        </BaseButton>
      </div>

      <div
        class="flex aspect-square flex-col justify-between rounded-xl bg-white p-5 shadow"
      >
        <div>
          <h2 class="mb-2 text-2xl font-semibold text-black">결제</h2>
          <p class="mb-4 text-gray-400">매출 확인 및 정산</p>
        </div>
        <BaseButton
          @click="router.push('/admin/sales')"
          class="rounded0 bg-black py-2 text-sm font-bold text-white"
        >
          이동하기
        </BaseButton>
      </div>

      <div
        class="flex aspect-square flex-col justify-between rounded-xl bg-white p-5 shadow"
      >
        <div>
          <h2 class="mb-2 text-2xl font-semibold text-black">설정</h2>
          <p class="mb-4 text-gray-400">관리자 설정</p>
        </div>
        <BaseButton
          @click="router.push('/admin/settings')"
          class="rounded0 py-2 text-sm font-bold"
        >
          이동하기
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 필요 시 추가적인 커스텀 스타일 */
</style>
