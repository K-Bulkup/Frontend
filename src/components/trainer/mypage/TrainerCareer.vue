<script setup>
import { ref, nextTick, watch } from "vue"; // watch 추가
import { trainerMyPageApi } from "@/composables/api/trainer/mypage/trainerMypageApi";
import careerMIcon from "@/assets/images/trainer/mypage/trainerCareerModify.svg";

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

// 함수들
const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (isEditing.value) {
    nextTick(() => {
      introTextarea.value?.focus();
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
  <div class="mx-5 rounded-2xl bg-gray-100 p-5">
    <div class="mb-4 flex items-center justify-between">
      <span class="font-medium text-black">트레이너 소개</span>
      <div class="flex items-center gap-2">
        <button
          @click="toggleEdit"
          class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100"
        >
          <img :src="careerMIcon" class="pointer-events-none h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="leading-relaxed">
      <textarea
        v-if="isEditing"
        v-model="introText"
        @blur="saveIntro"
        class="max-h-60 min-h-[60px] w-full resize-y overflow-y-auto border-none bg-transparent text-sm leading-relaxed text-black placeholder-gray-500 outline-none"
        style="-ms-overflow-style: none; scrollbar-width: none"
        placeholder="트레이너 소개를 입력하세요..."
        ref="introTextarea"
      />
      <div
        v-else
        class="max-h-60 overflow-y-auto"
        style="-ms-overflow-style: none; scrollbar-width: none"
      >
        <p class="m-0 min-h-[20px] text-sm text-black">
          {{ introText || "트레이너 소개를 입력하세요..." }}
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
