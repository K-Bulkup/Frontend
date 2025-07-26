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
  <div class="min-h-screen bg-realBlack text-white">
    <div class="mx-auto max-w-screen-md px-4">
      <RouterView />
    </div>
    <NavigationBar v-if="!$route.meta.hideNavbar" />
  </div>
</template>

<style></style>
