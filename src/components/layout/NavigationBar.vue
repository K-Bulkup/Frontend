<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const userStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const userType = computed(() => userStore.role?.toLowerCase() || "trainee");

const activeTab = computed(() => {
  const path = route.path;
  if (path.includes("/training")) return "training";
  if (path.includes("/asset")) return "asset";
  if (path.includes("/pt-history")) return "pt-history";
  return "home";
});

const navItems = {
  trainee: [
    { id: "training", icon: "book", label: "트레이닝", path: "/training" },
    { id: "home", icon: "home", label: "홈", path: "/trainee/mypage" },
    { id: "asset", icon: "layer-group", label: "자산", path: "/trainee/asset" },
  ],
  trainer: [
    {
      id: "training",
      icon: "book",
      label: "트레이닝",
      path: "/trainer/mypage/training",
    },
    { id: "home", icon: "home", label: "홈", path: "/trainer/mypage" },
    {
      id: "pt-history",
      icon: "comments",
      label: "1:1 PT",
      path: "/common/pt-history",
    },
  ],
};

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
  <nav
    class="absolute bottom-0 left-0 right-0 flex h-16 items-center justify-around border-t border-gray-700 bg-realBlack"
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
        class="text-caption"
        :class="activeTab === item.id ? 'text-primary' : 'text-white'"
      >
        {{ item.label }}
      </span>
    </div>
  </nav>
</template>
