<script setup>
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import { useAuthStore } from "./stores/auth";
import NavigationBar from "./components/layout/NavigationBar.vue";

const authStore = useAuthStore();
const route = useRoute();

onMounted(async () => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    authStore.setToken(token);
    try {
      await authStore.fetchUserInfo();
    } catch (err) {
      authStore.logout();
      router.push("/login");
    }
  }
});

const hideNavBar = computed(() => route.path.includes("chat"));
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-realBlack text-white"
  >
    <div
      class="relative flex h-[852px] w-[393px] flex-col overflow-hidden bg-realBlack shadow-2xl"
    >
      <main class="flex-1 overflow-y-auto scrollbar-hide">
        <RouterView />
      </main>

      <NavigationBar v-if="!$route.meta.hideNavbar" />
    </div>
  </div>
</template>
