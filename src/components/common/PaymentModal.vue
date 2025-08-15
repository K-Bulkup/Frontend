<template>
  <transition name="sheet">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-end justify-center bg-transparent"
      role="dialog"
      aria-modal="true"
      @click.self="$emit('close')"
    >
      <!-- 서비스 화면 폭에 맞추기 -->
      <!-- 우리 앱이 중앙 컨테이너를 max-w-sm(24rem=384px) 쓰면: -->
      <div
        class="mx-auto w-full max-w-sm rounded-t-2xl border border-gray-800/60 bg-realBlack px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        <div class="mx-auto mb-2 h-1.5 w-10 rounded-full bg-gray-700/40"></div>

        <h2
          class="font-subTitle mb-6 mt-6 text-center text-subTitle2 font-bold text-white"
        >
          결제 수단 선택
        </h2>

        <ul class="space-y-3">
          <li v-for="m in methods" :key="m.pg">
            <button
              class="w-full rounded-xl border border-gray-800/60 bg-background px-4 py-3 text-left text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white/10 active:scale-[0.98]"
              @click="$emit('select', m.pg)"
            >
              {{ m.label }}
            </button>
          </li>
        </ul>

        <button
          class="mt-4 w-full rounded-xl border border-gray-800/60 bg-transparent py-3 font-bold text-gray-300 transition hover:bg-white/5"
          @click="$emit('close')"
        >
          취소
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { toRefs } from "vue";
const props = defineProps({ visible: Boolean });
const { visible } = toRefs(props);

const methods = [
  { pg: "kakaopay", label: "카카오페이" },
  { pg: "tosspayments", label: "토스페이" },
  { pg: "payco", label: "페이코" },
  { pg: "html5_inicis", label: "이니시스" },
];
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(16px);
  opacity: 0;
}
</style>
