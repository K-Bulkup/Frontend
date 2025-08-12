<script setup>
import { ref, computed } from "vue";
const props = defineProps({
  title: String,
  description: String,
  loading: Boolean,
  minimal: { type: Boolean, default: false },
});
const emit = defineEmits(["submit"]);

const text = ref("");
const canSubmit = computed(() => text.value.trim().length > 0);

const onSubmit = () => {
  if (!canSubmit.value || props.loading) return;
  emit("submit", { text: text.value });
};
</script>

<template>
  <!-- 전체 모드 -->
  <section v-if="!minimal" class="space-y-4">
    <div class="rounded-xl bg-gray-900 p-4">
      <div class="mb-2 flex items-center gap-2">
        <h3 class="font-bold text-white">{{ title }}</h3>
        <span
          class="rounded-full bg-[#3A3A3A] px-2 py-[2px] text-[11px] leading-none text-white"
          >주관식</span
        >
      </div>
      <p class="text-gray-300">{{ description }}</p>
    </div>

    <div class="rounded-xl bg-gray-900 p-4">
      <textarea
        v-model="text"
        placeholder="답변을 입력해주세요"
        class="h-28 w-full resize-none rounded-lg bg-[#141414] p-3 text-white outline-none placeholder:text-gray-500"
      />
      <div class="mt-3">
        <button
          class="w-full rounded-lg bg-primary py-3 font-bold text-black disabled:opacity-70"
          :disabled="!canSubmit || loading"
          @click="onSubmit"
        >
          제출하기
        </button>
      </div>
    </div>
  </section>

  <!-- minimal 모드 -->
  <section v-else class="space-y-5">
    <textarea
      v-model="text"
      placeholder="답변을 입력해주세요"
      class="h-28 w-full resize-none rounded-lg bg-[#141414] p-3 text-white outline-none placeholder:text-gray-500"
    />
    <button
      class="w-full rounded-lg bg-primary py-3 font-bold text-black disabled:opacity-70"
      :disabled="!canSubmit || loading"
      @click="onSubmit"
    >
      제출하기
    </button>
  </section>
</template>
