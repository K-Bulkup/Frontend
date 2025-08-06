<template>
  <transition name="slide-up">
    <div
      v-if="visible"
      class="absolute inset-0 z-50 flex flex-col justify-end bg-black bg-opacity-50"
      @click.self="$emit('close')"
    >
      <div class="w-full rounded-t-2xl bg-realBlack p-6">
        <h2 class="mb-4 text-center text-title font-bold text-white">
          결제 수단 선택
        </h2>
        <ul class="space-y-3">
          <li v-for="m in methods" :key="m.pg">
            <button
              class="w-full rounded-xl bg-gray-800 px-4 py-3 font-semibold text-white transition hover:bg-gray-700"
              @click="$emit('select', m.pg)"
            >
              {{ m.label }}
            </button>
          </li>
        </ul>
        <button
          class="mt-6 w-full rounded-xl bg-gray-700 py-3 font-bold text-gray-200 transition hover:bg-gray-600"
          @click="$emit('close')"
        >
          취소
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({ visible: Boolean });

const methods = [
  { pg: "kakaopay", label: "카카오페이" },
  { pg: "tosspayments", label: "토스페이" },
  { pg: "payco", label: "페이코" },
  { pg: "html5_inicis", label: "이니시스" },
];
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
