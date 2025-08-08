<script setup>
import { watchEffect } from "vue";
import { Loader2Icon } from "lucide-vue-next";
import loadingGif from "@/assets/images/loading.gif";

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: "" }, // 예: "금육이가 답변 중입니다"
});

const emit = defineEmits(["close"]);

watchEffect(() => {
  document.body.style.overflow = props.show ? "hidden" : "";
});
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-live="polite"
      >
        <div
          class="mx-6 w-full max-w-sm rounded-2xl bg-white/90 p-6 text-center shadow-xl"
        >
          <div
            class="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full bg-white"
          >
            <img
              :src="loadingGif"
              alt="로딩 중"
              class="h-full w-full animate-pulse object-contain"
            />
          </div>

          <div class="mb-4 text-base font-semibold text-gray-800">
            {{ title }}
          </div>

          <div class="mt-2 flex items-center justify-center gap-2">
            <Loader2Icon class="h-5 w-5 animate-spin" />
            <span class="text-sm text-gray-700">처리 중...</span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
