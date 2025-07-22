<script setup>
import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
</script>

<template>
  <div class="min-h-screen bg-realBlack text-white">
    <div class="mx-auto max-w-screen-md px-4">
      <Header />
      <RouterView />
      <Footer />
    </div>
  </div>
</template>

<style></style>
