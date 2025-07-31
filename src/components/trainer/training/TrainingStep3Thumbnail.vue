<script setup>
import { ref, watch } from "vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";

const props = defineProps({
  modelValue: {
    type: File,
    default: null,
  },
});
const emit = defineEmits(["update:modelValue"]);

const thumbnailUrl = ref(null);

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    emit("update:modelValue", file);
    thumbnailUrl.value = URL.createObjectURL(file);
  }
};

const triggerFileInput = () => {
  document.getElementById("thumbnailInput").click();
};

watch(
  () => props.modelValue,
  (newFile) => {
    if (!newFile && thumbnailUrl.value) {
      URL.revokeObjectURL(thumbnailUrl.value);
      thumbnailUrl.value = null;
    }
  },
);
</script>

<template>
  <div>
    <BaseStatusMessage
      title="회원을 모집하겠습니까?"
      subtitle="커버 이미지를 등록하고 회원을 모집해주세요"
    />
    <div class="mt-12 flex flex-col items-center">
      <input
        id="thumbnailInput"
        type="file"
        class="hidden"
        accept="image/*"
        @change="onFileChange"
      />
      <div
        @click="triggerFileInput"
        class="flex h-64 w-full cursor-pointer items-center justify-center rounded-xl bg-gray-100 transition-colors hover:bg-gray-200"
      >
        <img
          v-if="thumbnailUrl"
          :src="thumbnailUrl"
          alt="Thumbnail preview"
          class="h-full w-full rounded-xl object-cover"
        />
        <div v-else class="text-center text-gray-700">
          <img
            src="@/assets/images/Image_Square_gray.svg"
            alt="이미지 업로드"
            class="mx-auto h-12 w-12"
          />
          <p class="mt-2 text-subtext">클릭하여 이미지 업로드</p>
        </div>
      </div>
    </div>
  </div>
</template>
