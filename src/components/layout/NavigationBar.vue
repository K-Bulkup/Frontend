<script setup>
import { computed, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCoins,
  faLayerGroup,
  faBook,
  faHome,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add(faCoins, faLayerGroup, faBook, faHome, faComments);
const app = getCurrentInstance().appContext.app;
app.component("font-awesome-icon", FontAwesomeIcon);

const userStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const userType = computed(() => userStore.role?.toLowerCase() || "trainee");

const activeTab = computed(() => {
  const path = route.path;
  // If path includes '/asset' (trainee) or '/mypage/report' (trainer), return "asset"
  if (path.includes("/asset") || path.includes("/mypage/report"))
    return "asset";
  if (path.includes("/training")) return "training";
  if (path.includes("/pt-history")) return "pt-history";
  return "home";
});

const navBackgroundClass = computed(() => {
  if (route.path === "/trainee/mypage") {
    // 해당 페이지일 경우 더 투명한 클래스 반환 (예: opacity 20%)
    return "bg-background/20";
  }
  return "bg-background/50";
});

const navItems = {
  trainee: [
    { id: "training", icon: "book", label: "트레이닝", path: "/training" },
    { id: "home", icon: "home", label: "홈", path: "/trainee/mypage" },
    {
      id: "asset",
      icon: "layer-group",
      label: "자산",
      path: "/trainee/asset",
    },
  ],
  trainer: [
    {
      id: "asset",
      icon: "coins",
      label: "수익 관리",
      path: "/trainer/mypage/report",
    },
    {
      id: "training",
      icon: "home",
      label: "홈",
      path: "/trainer/mypage/training",
    },
    {
      id: "pt-history",
      icon: "comments",
      label: "1:1 PT",
      path: "/common/pt/history",
    },
  ],
};

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
  <nav
    class="absolute bottom-0 left-0 right-0 flex h-16 items-center justify-around backdrop-blur-md"
    :class="navBackgroundClass"
  >
    <div
      v-for="item in navItems[userType]"
      :key="item.id"
      class="flex cursor-pointer flex-col items-center transition-opacity hover:opacity-80"
      @click="navigate(item.path)"
    >
      <font-awesome-icon
        :icon="['fas', item.icon]"
        class="mb-1"
        :class="activeTab === item.id ? 'text-primary' : 'text-white'"
      />
      <span
        class="text-body2"
        :class="activeTab === item.id ? 'text-primary' : 'text-white'"
      >
        {{ item.label }}
      </span>
    </div>
  </nav>
</template>
