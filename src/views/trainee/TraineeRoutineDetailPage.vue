<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";
import RoutineSubmitBar from "@/components/trainee/training/RoutineSubmitBar.vue";
import RoutineChat from "@/components/trainee/training/RoutineChat.vue";
import RoutineVideo from "@/components/trainee/training/RoutineVideo.vue";
import RoutineResultModal from "@/components/trainee/training/RoutineResultModal.vue";

const router = useRouter();

// --- 상태 (State) ---

// 예시 데이터
const RoutineData = ref({
  id: 1,
  title: "계좌 개설하기",
  description:
    "위 영상을 참고하여 과제를 수행하고 결과를 입력해주세요. 사진을 첨부하거나 텍스트로 답변할 수 있습니다.",
  level: "초급",
  category: "투자입문",
  reward: 2,
  videoUrl: "https://www.youtube.com/watch?v=c2v2NyDQhnw",
  completed: false,
});
const currentRoutine = ref(RoutineData.value);
const certificationPhotos = ref([
  {
    id: 1,
    description: "계좌 개설 완료",
    imageUrl: null,
    timestamp: new Date(),
    isUser: true, // 사용자가 보낸 메시지인지 구분을 위한 플래그
  },
]);

// AI 판별 및 모달 관련 상태 추가
const isLoading = ref(false); // AI가 판별하는 동안의 로딩 상태
const isResultModalVisible = ref(false);
const submissionStatus = ref("success"); // 'success' 또는 'failure'
const acquiredReward = ref(0);

// --- 메서드 (Methods) ---

const handleGoBack = () => router.back();

const openVideo = () => {
  if (currentRoutine.value?.videoUrl) {
    window.open(currentRoutine.value.videoUrl, "_blank");
  }
};

// AI 판별 로직이 적용된 제출 핸들러
const handleCertificationSubmit = async (submission) => {
  if (isLoading.value) return;
  isLoading.value = true;

  // 사용자가 제출한 내용을 채팅창에 먼저 표시
  const userSubmission = {
    id: Date.now(),
    description: submission.text,
    imageUrl: submission.imageUrl, // 미리보기를 위한 로컬 URL
    timestamp: new Date(),
    isUser: true,
  };
  certificationPhotos.value.push(userSubmission);

  // --- 벡엔드 연동 전, 테스트를 위한 시뮬레이션 코드 ---
  console.log("AI 판별 시뮬레이션 시작...");
  await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5초 딜레이

  try {
    // 50% 확률로 성공 또는 실패를 시뮬레이션합니다.
    const isCorrect = Math.random() > 0.5;
    const reward = isCorrect ? currentRoutine.value.reward : 0;

    console.log(`시뮬레이션 결과: ${isCorrect ? "성공" : "실패"}`);

    submissionStatus.value = isCorrect ? "success" : "failure";
    acquiredReward.value = reward;
  } catch (error) {
    // 테스트 중에는 거의 발생하지 않지만, 예외 처리 구문은 유지합니다.
    console.error("테스트 중 에러 발생:", error);
    submissionStatus.value = "failure";
    acquiredReward.value = 0;
  } finally {
    isLoading.value = false;
    isResultModalVisible.value = true; // 결과 모달 표시
  }
  // --- 시뮬레이션 코드 종료 ---
};

//   // 서버에 보낼 FormData 생성
//   const formData = new FormData();
//   formData.append("routineTitle", currentRoutine.value.title);
//   formData.append("submissionText", submission.text);
//   if (submission.imageFile) {
//     formData.append("submissionImage", submission.imageFile);
//   }

//   try {
//     // 1. 백엔드 서버에 AI 판별 요청
//     const response = await axios.post("/api/check-routine", formData);

//     // 2. 백엔드 결과로 모달 상태 설정
//     const { isCorrect, reward } = response.data;
//     submissionStatus.value = isCorrect ? "success" : "failure";
//     acquiredReward.value = reward || 0;
//   } catch (error) {
//     // 3. 에러 발생 시 실패 처리
//     console.error("AI 판별 요청 실패:", error);
//     submissionStatus.value = "failure";
//     acquiredReward.value = 0;
//   } finally {
//     isLoading.value = false;
//     isResultModalVisible.value = true; // 결과 모달 표시
//   }
// };

// 모달 닫기
const closeModal = () => {
  isResultModalVisible.value = false;

  if (submissionStatus.value === "success") {
    currentRoutine.value.completed = true;
    router.back(); // 성공 시에만 뒤로 가기
  }
};

// 다시 시도
const retrySubmission = () => {
  isResultModalVisible.value = false;
};
</script>

<template>
  <div class="flex h-screen flex-col bg-realBlack">
    <header class="flex-shrink-0 px-6 pt-10">
      <BaseHeader title="루틴 상세" @back="handleGoBack" />
    </header>

    <main class="flex-1 overflow-y-auto px-6 pb-40 pt-4 scrollbar-hide">
      <div class="mt-4 flex items-center gap-2">
        <BaseBadge>{{ currentRoutine.level }}</BaseBadge>
        <BaseBadge>{{ currentRoutine.category }}</BaseBadge>
        <BaseBadge variant="primary" class="ml-auto">
          리워드 {{ currentRoutine.reward }}P
        </BaseBadge>
      </div>

      <RoutineVideo :video-url="currentRoutine.videoUrl" @play="openVideo" />

      <h3 class="mb-4 mt-8 text-heading text-white">현재 루틴</h3>
      <div class="mb-6 rounded-xl bg-gray-900 p-4">
        <h3 class="mb-2 text-body font-bold text-white">
          {{ currentRoutine.title }}
        </h3>
        <p class="text-subtext leading-relaxed text-gray-400">
          {{ currentRoutine.description }}
        </p>
      </div>

      <div class="flex flex-col items-end space-y-3">
        <RoutineChat
          v-for="photo in certificationPhotos"
          :key="photo.id"
          :photo="photo"
        />
      </div>
    </main>

    <RoutineSubmitBar
      :is-loading="isLoading"
      @submit="handleCertificationSubmit"
    />

    <RoutineResultModal
      :is-visible="isResultModalVisible"
      :status="submissionStatus"
      :reward="acquiredReward"
      @close="closeModal"
      @retry="retrySubmission"
    />
  </div>
</template>
