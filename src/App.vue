<template>
  <div
    :class="{
      'flex min-h-screen items-center justify-center bg-realBlack text-white':
        !isAdminRoute,
      'min-h-screen bg-gray-100': isAdminRoute,
    }"
  >
    <div
      :class="{
        'relative flex h-[852px] w-[393px] flex-col overflow-hidden bg-realBlack shadow-2xl':
          !isAdminRoute,
        'flex-1': isAdminRoute,
      }"
    >
      <main class="flex-1 overflow-y-auto scrollbar-hide">
        <RouterView />
      </main>

      <NavigationBar v-if="!$route.meta.hideNavbar && !isAdminRoute" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import router from "@/router";
import { useAuthStore } from "./stores/auth";
import NavigationBar from "./components/layout/NavigationBar.vue";

const authStore = useAuthStore();

const isAdminRoute = computed(() => {
  return (
    router.currentRoute.value.path.startsWith("/admin") &&
    router.currentRoute.value.path !== "/admin/login"
  );
});

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
</script>
<template>
  <div
    class="bg-background flex min-h-screen items-center justify-center text-white"
  >
    <div
      class="relative flex h-screen w-[393px] flex-col overflow-hidden shadow-2xl"
      :style="Background"
    >
      <main class="flex-1 overflow-y-auto scrollbar-hide">
        <RouterView />
      </main>

      <NavigationBar v-if="!$route.meta.hideNavbar" />
    </div>
  </div>
</template>
