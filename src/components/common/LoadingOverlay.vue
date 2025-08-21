<script setup>
import { watchEffect } from "vue";
import { Loader2Icon, SparklesIcon } from "lucide-vue-next";
import runGeumyook from "@/assets/images/run_geumyook.gif";

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: "금육이가 답변 중입니다" },
});

watchEffect(() => {
  document.body.style.overflow = props.show ? "hidden" : "";
});
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-realBlack/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          class="mx-6 w-full max-w-[350px] rounded-2xl bg-background/80 p-6 text-center shadow-xl ring-1 ring-gray-800"
        >
          <div class="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
            <img
              :src="runGeumyook"
              alt="로딩 중"
              class="h-full w-full object-contain"
            />
          </div>

          <div class="mb-2 flex items-center justify-center gap-2">
            <SparklesIcon class="h-4 w-4 text-primary/80" aria-hidden="true" />
            <p class="text-subTitle2 font-semibold text-gray-50">
              {{ title }}
            </p>
          </div>

          <div class="mt-2 flex items-center justify-center gap-2">
            <Loader2Icon class="h-5 w-5 animate-spin text-primary" />
            <span class="text-body6 text-gray-300">처리 중…</span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
/* 페이드 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 진행바 키프레임 */
@keyframes progress {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(20%);
  }
  100% {
    transform: translateX(120%);
  }
}

/* 사용자가 '줄이기' 설정 시 모션 최소화 */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  [class*="animate-\\[progress"] {
    animation: none !important;
  }
}
</style>
