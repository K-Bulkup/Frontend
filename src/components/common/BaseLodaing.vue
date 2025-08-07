<script>
export default {
  name: "BaseLoading",
  props: {
    mainText: {
      type: String,
      default: "진위여부 확인 중입니다.",
    },
    subText: {
      type: String,
      default: "잠시만 기다려주세요",
    },
  },
};
</script>
<template>
  <div class="fixed inset-0 z-50 flex min-h-screen flex-col bg-realBlack">
    <!-- Main Loading Content -->
    <div class="flex flex-1 flex-col items-center justify-center px-4">
      <!-- Loading Spinner -->
      <div class="mb-8">
        <div class="animate-spin-slow h-16 w-16 md:h-20 md:w-20">
          <svg viewBox="0 0 50 50" class="h-full w-full">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="white"
              stroke-width="4"
              stroke-linecap="round"
              stroke-dasharray="90"
              stroke-dashoffset="60"
            />
          </svg>
        </div>
      </div>

      <!-- Loading Text -->
      <div class="text-center">
        <h2 class="mb-2 text-xl font-bold text-white md:text-2xl">
          {{ mainText }}
        </h2>
        <p class="text-sm text-white/80 md:text-base">
          {{ subText }}
        </p>
      </div>
    </div>
  </div>
</template>
<style scoped>
@keyframes spin-slow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 1.2s linear infinite;
  transform-origin: center;
}
</style>
