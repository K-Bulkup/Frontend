<script setup>
import { ref, nextTick, watch } from "vue";
import { trainerMyPageApi } from "@/composables/api/useTrainerMypageApi";
import editIcon from "@/assets/images/trainer/mypage/edit.png";

const props = defineProps({
  career: {
    type: String,
    default: "",
  },
});

const isEditing = ref(false);
const introText = ref(props.career);
const introTextarea = ref(null);

watch(
  () => props.career,
  (newCareer) => {
    introText.value = newCareer;
  },
  { immediate: true },
);

// 높이 자동 조절 함수
const adjustTextareaHeight = () => {
  nextTick(() => {
    const textarea = introTextarea.value;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 300);
      textarea.style.height = newHeight + "px";
    }
  });
};

// 텍스트 입력시 높이 조절
const handleInput = () => {
  adjustTextareaHeight();
};

// 함수들
const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (isEditing.value) {
    nextTick(() => {
      introTextarea.value?.focus();
      adjustTextareaHeight(); // 편집 시작시 높이 조절
    });
  }
};

const saveIntro = async () => {
  try {
    await trainerMyPageApi.updateIntroduction(introText.value);
    isEditing.value = false;
  } catch (error) {
    console.error("소개 저장 실패:", error);
  }
};
</script>

<template>
  <div class="relative mx-2 rounded-2xl bg-gray-900 p-5">
    <!-- 수정 버튼 -->
    <button
      @click="toggleEdit"
      class="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#303030] transition-opacity hover:opacity-70"
    >
      <img :src="editIcon" class="pointer-events-none h-6 w-6" />
    </button>

    <div class="leading-relaxed" style="word-break: keep-all">
      <textarea
        v-if="isEditing"
        v-model="introText"
        @input="handleInput"
        @blur="saveIntro"
        class="w-full resize-none overflow-y-auto border-none bg-transparent text-sm leading-relaxed text-white placeholder-gray-500 outline-none"
        style="
          min-height: 10px;
          max-height: 300px;
          -ms-overflow-style: none;
          scrollbar-width: none;
        "
        placeholder="소개글을 작성해주세요 !"
        ref="introTextarea"
      />
      <div
        v-else
        class="max-h-[300px] overflow-y-auto"
        style="-ms-overflow-style: none; scrollbar-width: none"
      >
        <p
          class="m-0 min-h-[20px] whitespace-pre-wrap text-sm text-white"
          :class="{ 'text-center': !introText }"
        >
          {{ introText || "소개글을 작성해주세요 !" }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea::-webkit-scrollbar,
div::-webkit-scrollbar {
  display: none;
}
</style>
