<script setup>
import { ref, computed, onBeforeUnmount } from "vue";

const props = defineProps({
  title: String,
  description: String,
  loading: Boolean,
  minimal: { type: Boolean, default: false },
});
const emit = defineEmits(["submit"]);

const memo = ref("");
const file = ref(/** @type {File|null} */ null);
const url = ref("");

const fileInput = ref(null);
let previewObjectUrl = null;
const previewUrl = ref("");

const hasEvidence = computed(() => !!file.value || url.value.trim().length > 0);

const revokePreview = () => {
  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
  previewObjectUrl = null;
};

const setPreview = (f) => {
  revokePreview();
  if (f) {
    previewObjectUrl = URL.createObjectURL(f);
    previewUrl.value = previewObjectUrl;
  } else {
    previewUrl.value = "";
  }
};

const onFileChange = (e) => {
  const f = e.target.files?.[0];
  file.value = f ?? null;
  setPreview(file.value);
};

const onDrop = (e) => {
  const f = e.dataTransfer?.files?.[0];
  if (!f) return;
  file.value = f;
  setPreview(f);
};

const triggerPicker = () => fileInput.value?.click();

const removeFile = () => {
  file.value = null;
  setPreview(null);
};

const onSubmit = () => {
  if (!hasEvidence.value || props.loading) return;
  const joinedText = [memo.value, url.value].filter(Boolean).join("\n");
  emit("submit", {
    text: joinedText,
    imageFile: file.value || null,
  });
};

onBeforeUnmount(revokePreview);
</script>

<template>
  <!-- 전체 모드 -->
  <section v-if="!minimal" class="space-y-4">
    <div class="rounded-xl bg-gray-900 p-4">
      <div class="mb-2 flex items-center gap-2">
        <h3 class="font-bold text-white">{{ title }}</h3>
        <span
          class="rounded-full bg-[#3A3A3A] px-2 py-[2px] text-[11px] leading-none text-white"
        >
          실천형
        </span>
      </div>
      <p class="text-gray-300">{{ description }}</p>
    </div>

    <!-- 업로드 박스 -->
    <div class="rounded-xl bg-[#0F0F0F] p-4">
      <p class="mb-2 text-body2 text-gray-400">인증 사진 업로드</p>

      <div
        class="cursor-pointer rounded-xl border border-dashed border-gray-700 bg-[#121212] p-4 text-center text-gray-300 transition hover:bg-[#141414]"
        @click="triggerPicker"
        @dragover.prevent
        @drop.prevent="onDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileChange"
        />

        <!-- 선택 전 -->
        <div
          v-if="!file"
          class="flex flex-col items-center justify-center py-6"
        >
          <!-- 업로드 아이콘 -->
          <svg
            viewBox="0 0 24 24"
            class="h-8 w-8 text-gray-500"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            />
          </svg>
          <p class="mt-3 font-semibold text-white">사진을 업로드해주세요</p>
          <p class="mt-1 text-body3 text-gray-500">
            JPG, PNG 확장자 업로드 가능합니다
          </p>
        </div>

        <!-- 선택 후 -->
        <div v-else class="flex items-center gap-3 text-left">
          <img
            :src="previewUrl"
            alt="preview"
            class="h-14 w-14 rounded-lg object-cover"
          />
          <div class="flex-1">
            <p class="truncate text-body text-white">{{ file.name }}</p>
            <button
              class="mt-1 text-body3 text-gray-400 underline underline-offset-2 hover:text-white"
              @click.stop="removeFile"
            >
              변경/삭제
            </button>
          </div>
        </div>
      </div>
    </div>

    <button
      class="w-full rounded-lg bg-primary py-3 font-bold text-black disabled:opacity-70"
      :disabled="!hasEvidence || loading"
      @click="onSubmit"
    >
      제출하기
    </button>
  </section>

  <!-- 모달용(minimal) -->
  <section v-else class="space-y-5">
    <p class="text-body2 text-gray-400">인증 사진 업로드</p>

    <div
      class="cursor-pointer rounded-xl border border-dashed border-gray-700 bg-[#121212] p-4 text-center text-gray-300 transition hover:bg-[#141414]"
      @click="triggerPicker"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      />

      <div v-if="!file" class="flex flex-col items-center justify-center py-6">
        <svg
          viewBox="0 0 24 24"
          class="h-8 w-8 text-gray-500"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
          />
        </svg>
        <p class="mt-3 font-semibold text-white">사진을 업로드해주세요</p>
        <p class="mt-1 text-body3 text-gray-500">
          JPG, PNG 확장자 업로드 가능합니다
        </p>
      </div>

      <div v-else class="flex items-center gap-3 text-left">
        <img
          :src="previewUrl"
          alt="preview"
          class="h-14 w-14 rounded-lg object-cover"
        />
        <div class="flex-1">
          <p class="truncate text-body text-white">{{ file.name }}</p>
          <button
            class="mt-1 text-body3 text-gray-400 underline underline-offset-2 hover:text-white"
            @click.stop="removeFile"
          >
            변경/삭제
          </button>
        </div>
      </div>
    </div>

    <button
      class="w-full rounded-lg bg-primary py-3 font-bold text-black disabled:opacity-70"
      :disabled="!hasEvidence || loading"
      @click="onSubmit"
    >
      제출하기
    </button>
  </section>
</template>
