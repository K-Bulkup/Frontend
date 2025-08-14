<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import BaseTabNavigation from "@/components/common/BaseTabNavigation.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";

// PT 관련 페이지 컴포넌트들 import
import PtHistoryPage from "@/views/chat/PtHistoryPage.vue";
import TrainerPtReservationPage from "@/views/chat/TrainerPtReservationPage.vue";
import TrainerPtSchedulePage from "@/views/chat/TrainerPtSchedulePage.vue";
import TraineePtSchedulePage from "@/views/chat/TraineePtSchedulePage.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 탭 구성 정의
const tabs = computed(() => {
  const baseTabs = [
    {
      id: "history",
      label: "1:1 PT",
      path: "/common/pt/history",
    },
  ];

  // 역할별 탭 추가
  if (authStore.role === "TRAINER") {
    baseTabs.push(
      {
        id: "reservation",
        label: "PT 예약",
        path: "/trainer/pt/reservation",
      },
      {
        id: "schedule",
        label: "PT 스케줄",
        path: "/trainer/pt/schedule",
      },
    );
  } else if (authStore.role === "TRAINEE") {
    baseTabs.push({
      id: "schedule",
      label: "스케줄 관리",
      path: "/trainee/pt/schedule",
    });
  }

  return baseTabs;
});

// 현재 경로에서 활성 탭 결정
const currentTab = computed(() => {
  const currentPath = route.path;
  const foundTab = tabs.value.find((tab) => tab.path === currentPath);
  return foundTab ? foundTab.id : "history"; // 기본값은 history
});

// 탭 변경 핸들러
const handleTabChange = (tabId) => {
  const targetTab = tabs.value.find((tab) => tab.id === tabId);
  if (targetTab && targetTab.path !== route.path) {
    router.push(targetTab.path);
  }
};
</script>

<template>
  <div class="flex min-h-screen flex-col px-2">
    <BaseHeader title="1:1 PT" @back="goBack" />
    <BaseTabNavigation
      :tabs="tabs"
      :default-tab="currentTab"
      container-class="max-w-6xl mx-auto px-4 pt-6"
      @tab-change="handleTabChange"
    >
      <!-- PT 내역 탭 -->
      <template #history>
        <PtHistoryPage />
      </template>

      <!-- 예약 관리 탭 (트레이너만) -->
      <template #reservation v-if="authStore.role === 'TRAINER'">
        <TrainerPtReservationPage />
      </template>

      <!-- 스케줄 관리 탭 (트레이너용) -->
      <template #schedule v-if="authStore.role === 'TRAINER'">
        <TrainerPtSchedulePage />
      </template>

      <!-- 스케줄 관리 탭 (트레이니용) -->
      <template #schedule v-if="authStore.role === 'TRAINEE'">
        <TraineePtSchedulePage />
      </template>
    </BaseTabNavigation>
  </div>
</template>
