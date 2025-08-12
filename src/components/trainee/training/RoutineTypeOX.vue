<script setup>
import { ref, computed } from "vue";
const props = defineProps({
  title: String,
  description: String,
  loading: Boolean,
  minimal: { type: Boolean, default: false },
});
const emit = defineEmits(["submit"]);

const choice = ref(null); // 'O' | 'X'
const reason = ref("");

const canSubmit = computed(() => !!choice.value);

const onSubmit = () => {
  if (!canSubmit.value || props.loading) return;
  const text = `[${choice.value}] ${reason.value || ""}`.trim();
  emit("submit", { text });
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
          >OX</span
        >
      </div>
      <p class="text-gray-300">{{ description }}</p>
    </div>

    <div class="space-y-4 rounded-xl bg-gray-900 p-4">
      <div class="flex items-center gap-2">
        <button
          class="flex-1 rounded-lg py-3 font-bold"
          :class="
            choice === 'O' ? 'bg-primary text-black' : 'bg-[#1A1A1A] text-white'
          "
          @click="choice = 'O'"
        >
          O
        </button>
        <button
          class="flex-1 rounded-lg py-3 font-bold"
          :class="
            choice === 'X' ? 'bg-primary text-black' : 'bg-[#1A1A1A] text-white'
          "
          @click="choice = 'X'"
        >
          X
        </button>
      </div>

      <textarea
        v-model="reason"
        placeholder="설명을 덧붙이고 싶다면 입력해주세요(선택)"
        class="h-24 w-full resize-none rounded-lg bg-[#141414] p-3 text-white outline-none placeholder:text-gray-500"
      />

      <button
        class="w-full rounded-lg bg-primary py-3 font-bold text-black disabled:opacity-70"
        :disabled="!canSubmit || loading"
        @click="onSubmit"
      >
        제출하기
      </button>
    </div>
  </section>

  <!-- minimal 모드 -->
  <section v-else class="space-y-5">
    <div class="flex items-center gap-2">
      <button
        class="flex-1 rounded-lg py-3 font-bold"
        :class="
          choice === 'O' ? 'bg-primary text-black' : 'bg-[#1A1A1A] text-white'
        "
        @click="choice = 'O'"
      >
        O
      </button>
      <button
        class="flex-1 rounded-lg py-3 font-bold"
        :class="
          choice === 'X' ? 'bg-primary text-black' : 'bg-[#1A1A1A] text-white'
        "
        @click="choice = 'X'"
      >
        X
      </button>
    </div>

    <textarea
      v-model="reason"
      placeholder="설명(선택)"
      class="h-24 w-full resize-none rounded-lg bg-[#141414] p-3 text-white outline-none placeholder:text-gray-500"
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
