<script setup>
import { reactive, ref, onMounted, computed } from "vue";

import ImageUploadModal from "./ImageUploadModal.vue";
import TrainerCareer from "@/components/trainer/mypage/TrainerCareer.vue";
import { trainerMyPageApi } from "@/composables/api/useTrainerMypageApi";

import starIcon from "@/assets/images/star.svg";
import profileDefault from "@/assets/images/trainer/mypage/profile.png";

// 반응형 데이터
const trainerData = reactive({
  username: "",
  userProfileUrl: profileDefault,
  career: "",
  certificates: [], // API에서 자격증 정보에 따라 설정
  totalTraineeCount: 0,
  totalAverageRating: 0.0,
});

const introText = ref("");
const showImageModal = ref(false);
const showTooltip = ref(false); // 툴팁 표시 상태

// 트레이너 정보 조회
const fetchTrainerInfo = async () => {
  try {
    const response = await trainerMyPageApi.getTrainerInfo();
    const { userProfileUrl, ...otherData } = response.data;

    if (userProfileUrl) {
      trainerData.userProfileUrl = userProfileUrl;
    }

    Object.assign(trainerData, otherData);

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
    formData.append("profileImage", imageFile);

    const response = await trainerMyPageApi.uploadProfileImage(formData);
    trainerData.userProfileUrl = response.data.profileImgUrl;

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
  <div class="flex flex-col items-center overflow-hidden px-6">
    <!-- 프로필 카드 -->
    <div
      class="flex w-full max-w-md flex-col items-center rounded-3xl px-8 py-5"
    >
      <!-- 프로필 이미지 -->
      <div class="relative mb-3">
        <div
          class="flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-700 shadow-lg transition-transform hover:scale-105"
          @click="openImageUpload"
        >
          <img
            v-if="trainerData.userProfileUrl"
            :src="trainerData.userProfileUrl"
            alt="프로필"
            class="h-full w-full object-cover"
          />
        </div>
      </div>

      <!-- 트레이너 이름 -->
      <div class="text-center text-title font-semibold text-white">
        {{ trainerData.username }}
      </div>

      <!-- 통계 정보 -->
      <div class="flex w-full items-center justify-center gap-3 text-lg">
        <div class="flex items-center gap-0.5 text-white">
          <span class="text-body">수강생</span>
          <span class="text-body font-semibold">{{
            trainerData.totalTraineeCount.toLocaleString()
          }}</span>
        </div>

        <div class="flex items-center gap-0.5">
          <img :src="starIcon" alt="별점" class="h-4 w-4" />
          <span class="text-body font-semibold">
            {{ trainerData.totalAverageRating.toFixed(1) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 경력 정보 -->
    <div class="w-full items-center">
      <TrainerCareer :career="introText" />
    </div>

    <!-- 이미지 업로드 모달 -->
    <ImageUploadModal
      v-if="showImageModal"
      @close="closeImageModal"
      @upload="handleImageUpload"
    />
  </div>
</template>
