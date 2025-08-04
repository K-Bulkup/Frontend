<script setup>
import { reactive, ref, onMounted, computed } from "vue";

import ImageUploadModal from "./ImageUploadModal.vue";
import TrainerCareer from "@/components/trainer/mypage/TrainerCareer.vue";
import { trainerMyPageApi } from "@/composables/api/useTrainerMypageApi";

import badgeIcon from "@/assets/images/trainer/mypage/badge.png";
import starIcon from "@/assets/images/star.svg";

// 반응형 데이터
const trainerData = reactive({
  username: "",
  userProfileUrl: null,
  career: "",
  certificates: [], // API에서 자격증 정보에 따라 설정
  totalTraineeCount: 0,
  totalAverageRating: 0.0,
});

const introText = ref("안녕하세요!");
const showImageModal = ref(false);
const showTooltip = ref(false); // 툴팁 표시 상태

// 트레이너 정보 조회
const fetchTrainerInfo = async () => {
  try {
    const response = await trainerMyPageApi.getTrainerInfo();
    Object.assign(trainerData, response.data);
    if (response.data.career) {
      introText.value = response.data.career;
    }
  } catch (error) {
    console.error("트레이너 정보 조회 실패:", error);
  }
};

// 이미지 업로드 모달 열기
const openImageUpload = () => {
  showImageModal.value = true;
};

// 이미지 업로드 모달 닫기
const closeImageModal = () => {
  showImageModal.value = false;
};

// 이미지 업로드 처리
const handleImageUpload = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await trainerMyPageApi.uploadProfileImage(formData);
    trainerData.userProfileUrl = response.data.imageUrl;

    closeImageModal();
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
  }
};

onMounted(() => {
  fetchTrainerInfo();
});

defineExpose({
  fetchTrainerInfo,
  trainerData,
});
</script>

<template>
  <div class="flex flex-col overflow-hidden">
    <div class="flex-shrink-0 px-5 py-6">
      <div class="flex items-start gap-4">
        <div class="relative">
          <div
            class="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-gray-600 bg-gray-700"
            @click="openImageUpload"
          >
            <img
              v-if="trainerData.userProfileUrl"
              :src="trainerData.userProfileUrl"
              alt="프로필"
              class="h-full w-full object-cover"
            />
            <i v-else class="fas fa-user text-4xl text-gray-400"></i>
          </div>
        </div>

        <div class="mt-2 min-w-0 flex-1">
          <div class="mt-1 flex items-center gap-3">
            <span class="text-[30px] font-bold">{{
              trainerData.username
            }}</span>

            <div
              v-if="
                trainerData.certificates && trainerData.certificates.length > 0
              "
              class="relative inline-block"
              @mouseenter="showTooltip = true"
              @mouseleave="showTooltip = false"
            >
              <span
                class="flex cursor-default items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-black"
              >
                <img :src="badgeIcon" alt="인증" class="h-4 w-4" />
                인증 완료
              </span>

              <Transition
                enter-active-class="transition-all duration-200"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-150"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-if="showTooltip"
                  class="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2"
                >
                  <div
                    class="min-w-max rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
                  >
                    <div class="text-gray-200">
                      {{ trainerData.certificates.join(", ") }}
                    </div>
                    <div
                      class="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 border-b-4 border-l-4 border-r-4 border-transparent border-b-gray-900"
                    ></div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-5 text-sm">
            <span class="text-gray-100">
              <span class="font-bold"> 👤 </span>
              {{ trainerData.totalTraineeCount.toLocaleString() }}명
            </span>
            <span class="text-gray-400">|</span>
            <span class="flex items-center gap-1">
              <span>
                <img :src="starIcon" alt="별점" class="h-4 w-4" />
              </span>
              <span class="font-medium text-gray-100">
                {{ trainerData.totalAverageRating.toFixed(1) }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <TrainerCareer :career="introText" />

    <ImageUploadModal
      v-if="showImageModal"
      @close="closeImageModal"
      @upload="handleImageUpload"
    />
  </div>
</template>
