<script setup>
defineProps({
  career: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div class="mx-5 min-h-60 rounded-2xl bg-white p-5 shadow-md">
    <div class="mb-4 flex items-center justify-between">
      <span class="font-medium text-black">트레이너 소개</span>
    </div>

    <div class="leading-relaxed">
      <div
        class="max-h-60 overflow-y-auto"
        style="-ms-overflow-style: none; scrollbar-width: none"
      >
        <p class="m-0 min-h-[20px] whitespace-pre-line text-sm text-black">
          {{ career || "등록된 소개가 없습니다." }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
div::-webkit-scrollbar {
  display: none;
}
</style>
