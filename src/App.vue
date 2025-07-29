<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";

import NavigationBar from "./components/layout/NavigationBar.vue";

const authStore = useAuthStore();

onMounted(async () => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    authStore.setToken(token);
    await authStore.fetchUserInfo();
  }
});
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-realBlack text-white"
  >
    <div
      class="relative flex h-[852px] w-[393px] flex-col overflow-hidden bg-realBlack shadow-2xl"
    >
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>

      <NavigationBar />
    </div>
  </div>
</template>

<style></style>
