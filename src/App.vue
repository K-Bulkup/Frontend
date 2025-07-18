<script setup>
import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
</script>

<template>
  <div>
    <Header />
    <div class="text-title text-primary">안녕하세요.</div>
    <div class="rounded-lg bg-blue-500 p-2 text-white"></div>
    <RouterView />
    <Footer />
  </div>
</template>

<style></style>
