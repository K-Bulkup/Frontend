<script setup>
import { ref } from "vue";

// Emits
const emit = defineEmits(["close", "upload"]);

// 반응형 데이터
const isDragOver = ref(false);
const previewImage = ref(null);
const selectedFile = ref(null);
const isUploading = ref(false);
const fileInput = ref(null);

// 파일 검증
const validateFile = (file) => {
  const validTypes = ["image/jpeg", "image/png", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    alert("JPG, PNG, GIF 파일만 업로드 가능합니다.");
    return false;
  }

  if (file.size > maxSize) {
    alert("파일 크기가 5MB를 초과합니다.");
    return false;
  }

  return true;
};

// 미리보기 생성
const createPreview = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// 파일 선택 처리
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && validateFile(file)) {
    selectedFile.value = file;
    createPreview(file);
  }
};

// 드래그 앤 드롭 처리
const handleDrop = (event) => {
  isDragOver.value = false;
  const file = event.dataTransfer.files[0];
  if (file && validateFile(file)) {
    selectedFile.value = file;
    createPreview(file);
  }
};

// 파일 대화상자 열기
const openFileDialog = () => {
  fileInput.value?.click();
};

// 카메라 열기 (실제 구현은 브라우저 지원에 따라)
const openCamera = () => {
  // 카메라 접근 로직
  console.log("카메라 기능은 실제 앱에서 구현됩니다.");
};

// 미리보기 제거
const removePreview = () => {
  previewImage.value = null;
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// 업로드 처리
const handleUpload = async () => {
  if (!selectedFile.value) return;

  isUploading.value = true;
  try {
    emit("upload", selectedFile.value);
  } catch (error) {
    console.error("업로드 실패:", error);
  } finally {
    isUploading.value = false;
  }
};

// 오버레이 클릭 시 모달 닫기
const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    emit("close");
  }
};
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-5"
    @click="handleOverlayClick"
  >
    <div
      class="max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl bg-gray-800 text-white"
      @click.stop
    >
      <!-- 모달 헤더 -->
      <div
        class="flex items-center justify-between border-b border-gray-700 p-5"
      >
        <h3 class="m-0 text-lg font-semibold">프로필 사진 변경</h3>
        <button
          class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white"
          @click="$emit('close')"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- 모달 바디 -->
      <div class="p-5">
        <!-- 업로드 영역 -->
        <div
          class="relative mb-5 cursor-pointer rounded-xl border-2 border-dashed border-gray-600 p-10 text-center transition-all duration-300"
          :class="{ 'border-blue-500 bg-blue-500 bg-opacity-10': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
        >
          <!-- 미리보기 이미지 -->
          <div v-if="previewImage" class="relative inline-block">
            <img
              :src="previewImage"
              alt="미리보기"
              class="max-h-[200px] max-w-[200px] rounded-lg object-cover"
            />
            <button
              class="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-red-500 text-xs text-white"
              @click="removePreview"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- 업로드 플레이스홀더 -->
          <div v-else>
            <i
              class="fas fa-cloud-upload-alt mb-4 block text-5xl text-gray-500"
            ></i>
            <p class="m-0 mb-2 text-base text-gray-300">
              이미지를 드래그하거나 클릭하여 업로드하세요
            </p>
            <small class="text-sm text-gray-400"
              >JPG, PNG, GIF 파일만 지원됩니다 (최대 5MB)</small
            >
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="flex gap-3 border-t border-gray-700 p-5">
        <button
          class="flex-1 cursor-pointer rounded-lg border-none bg-gray-700 p-3 text-base text-white transition-colors duration-300 hover:bg-gray-600"
          @click="$emit('close')"
        >
          취소
        </button>
        <button
          class="flex-1 cursor-pointer rounded-lg border-none bg-blue-600 p-3 text-base text-white transition-colors duration-300 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:opacity-60"
          :class="{ 'hover:bg-blue-700': !isUploading && selectedFile }"
          :disabled="!selectedFile || isUploading"
          @click="handleUpload"
        >
          <span v-if="isUploading">업로드 중...</span>
          <span v-else>업로드</span>
        </button>
      </div>
    </div>
  </div>
</template>
