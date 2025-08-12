<template>
  <div class="flex min-h-screen bg-[#000000] text-white">
    <AdminSidebar />
    <div class="flex-1 p-6">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from "@/components/layout/AdminSidebar.vue";
</script>

<style scoped>
/* Add specific styles if necessary */
</style>
