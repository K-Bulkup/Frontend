<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["submit"]);

const newCertificationText = ref("");
const selectedImageFile = ref(null);
const selectedImageUrl = ref(null);
const fileInput = ref(null);

const canSubmit = computed(() => {
  return (
    newCertificationText.value.trim().length > 0 || selectedImageFile.value
  );
});

const triggerFileInput = () => fileInput.value?.click();

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImageFile.value = file;
    selectedImageUrl.value = URL.createObjectURL(file);
  }
};

const removeSelectedImage = () => {
  selectedImageFile.value = null;
  selectedImageUrl.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const handleSubmit = () => {
  if (!canSubmit.value) return;

  emit("submit", {
    text: newCertificationText.value,
    imageFile: selectedImageFile.value,
    imageUrl: selectedImageUrl.value,
  });

  // 제출 후 입력 필드 초기화
  newCertificationText.value = "";
  removeSelectedImage();
};
</script>

<template>
  <footer class="absolute bottom-16 left-0 right-0 bg-realBlack px-6 pb-4 pt-2">
    <div class="rounded-xl bg-gray-100 p-2">
      <div class="flex items-center space-x-3">
        <button
          @click="triggerFileInput"
          class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 transition-colors hover:bg-gray-400"
        >
          <img src="@/assets/images/plus.svg" alt="추가 버튼" />
        </button>
        <input
          v-model="newCertificationText"
          type="text"
          placeholder="과제 결과를 입력해주세요..."
          class="flex-1 bg-transparent text-body text-black outline-none placeholder:text-gray-500"
          @keypress.enter.prevent="handleSubmit"
        />
        <button
          @click="handleSubmit"
          :disabled="!canSubmit"
          :class="[
            'rounded-lg px-4 py-2 text-subtext font-medium transition-colors',
            canSubmit
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'cursor-not-allowed bg-gray-300 text-gray-500',
          ]"
        >
          제출
        </button>
      </div>
      <div v-if="selectedImageUrl" class="mt-4">
        <div class="relative inline-block">
          <img
            :src="selectedImageUrl"
            alt="선택된 이미지"
            class="h-24 w-24 rounded-lg object-cover"
          />
          <button
            @click="removeSelectedImage"
            class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <img
              src="@/assets/images/trainee/training/close_white.svg"
              alt="이미지 삭제"
            />
          </button>
        </div>
      </div>
    </div>
  </footer>

  <input
    ref="fileInput"
    type="file"
    accept="image/*"
    class="hidden"
    @change="onFileSelected"
  />
</template>
