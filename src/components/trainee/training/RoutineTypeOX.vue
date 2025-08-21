<script setup>
import { ref, computed } from "vue";
import BaseSelectButton from "@/components/common/BaseSelectButton.vue";

const props = defineProps({
  title: String,
  description: String,
  loading: Boolean,
  minimal: { type: Boolean, default: false },
});
const emit = defineEmits(["submit"]);

const choice = ref(null); // 'O' | 'X'

// 선택된 경우만 제출 가능
const canSubmit = computed(() => !!choice.value);

// 서버에는 항상 대문자 'O' 또는 'X'만 보냄
const onSubmit = () => {
  if (!canSubmit.value || props.loading) return;
  emit("submit", { text: String(choice.value).toUpperCase() });
};
</script>

<template>
  <!-- 전체 모드 -->
  <section v-if="!minimal" class="space-y-4">
    <!-- 상단 설명 카드 -->
    <div class="rounded-xl bg-gray-900 p-4">
      <div class="mb-2 flex items-center gap-2">
        <h3 class="font-bold text-white">{{ title }}</h3>
        <span
          class="rounded-full bg-[#3A3A3A] px-2 py-[2px] text-[11px] leading-none text-white"
        >
          OX
        </span>
      </div>
      <p class="text-gray-300">{{ description }}</p>
    </div>

    <!-- 답안 선택: 공용 컴포넌트로 대체 -->
    <div class="space-y-3 rounded-xl bg-gray-900 p-4">
      <div class="text-body3 text-gray-400">답안 선택</div>

      <!-- v-model 이 선택값('O' | 'X')를 바인딩 -->
      <BaseSelectButton v-model="choice" :options="['O', 'X']" />

      <button
        class="mt-2 w-full rounded-lg bg-primary py-3 font-bold text-black disabled:opacity-70"
        :disabled="!canSubmit || loading"
        @click="onSubmit"
      >
        제출하기
      </button>
    </div>
  </section>

  <!-- 모달에서 쓰는 최소 모드 -->
  <section v-else class="space-y-6">
    <div class="text-body3 text-gray-400">답안 선택</div>

    <BaseSelectButton v-model="choice" :options="['O', 'X']" />

    <button
      class="w-full rounded-lg bg-primary py-3 font-bold text-black disabled:opacity-70"
      :disabled="!canSubmit || loading"
      @click="onSubmit"
    >
      제출하기
    </button>
  </section>
</template>
