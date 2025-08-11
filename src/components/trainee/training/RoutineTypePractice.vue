<script setup>
import { ref, computed } from "vue";
const props = defineProps({
  title: String,
  description: String,
  loading: Boolean,
  minimal: { type: Boolean, default: false },
});
const emit = defineEmits(["submit"]);

const memo = ref("");
const file = ref(null);
const url = ref("");

const hasEvidence = computed(() => !!file.value || url.value.trim().length > 0);

const onFileChange = (e) => {
  const f = e.target.files?.[0];
  file.value = f ?? null;
};
const onSubmit = () => {
  if (!hasEvidence.value || props.loading) return;
  emit("submit", {
    text: memo.value,
    imageFile: file.value,
    imageUrl: url.value || undefined,
  });
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
          >실천형</span
        >
      </div>
      <p class="text-gray-300">{{ description }}</p>
    </div>

    <div class="space-y-4 rounded-xl bg-gray-900 p-4">
      <label
        class="block cursor-pointer rounded-lg bg-[#1A1A1A] p-4 text-center text-gray-300"
      >
        <input
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileChange"
        />
        증빙 이미지 업로드
      </label>

      <input
        v-model="url"
        placeholder="또는 증빙 URL을 입력하세요(선택)"
        class="w-full rounded-lg bg-[#1A1A1A] p-3 text-white outline-none placeholder:text-gray-500"
      />

      <textarea
        v-model="memo"
        placeholder="메모(선택)"
        class="h-24 w-full resize-none rounded-lg bg-[#141414] p-3 text-white outline-none placeholder:text-gray-500"
      />

      <button
        class="w-full rounded-lg bg-primary py-3 font-bold text-black disabled:opacity-70"
        :disabled="!hasEvidence || loading"
        @click="onSubmit"
      >
        제출하기
      </button>
    </div>
  </section>

  <!-- minimal 모드 -->
  <section v-else class="space-y-5">
    <label
      class="block cursor-pointer rounded-lg bg-[#1A1A1A] p-4 text-center text-gray-300"
    >
      <input
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      />
      증빙 이미지 업로드
    </label>

    <input
      v-model="url"
      placeholder="또는 증빙 URL(선택)"
      class="w-full rounded-lg bg-[#1A1A1A] p-3 text-white outline-none placeholder:text-gray-500"
    />

    <textarea
      v-model="memo"
      placeholder="메모(선택)"
      class="h-24 w-full resize-none rounded-lg bg-[#141414] p-3 text-white outline-none placeholder:text-gray-500"
    />

    <button
      class="w-full rounded-lg bg-primary py-3 font-bold text-black disabled:opacity-70"
      :disabled="!hasEvidence || loading"
      @click="onSubmit"
    >
      제출하기
    </button>
  </section>
</template>
