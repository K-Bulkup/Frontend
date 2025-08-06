<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// 아이콘 임포트 (실제 프로젝트 경로에 맞게 수정)
import badgeIcon from "@/assets/images/trainer/mypage/badge.png";
import starIcon from "@/assets/images/star.svg";
import profileDefault from "@/assets/images/mascot/profile.png";
import TrainerCareerDisplay from "@/components/trainee/trainer/TrainerCareerDisplay.vue";
import TrainingList from "@/components/trainee/trainer/TrainingList.vue";

const router = useRouter();

// --- API 모의 함수 ---
const trainerMyPageApi = {
  getTrainerInfo: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {
        username: "김헬스",
        userProfileUrl: null,
        career:
          "안녕하세요! 10년 경력의 금육 트레이너 김헬스입니다. 회원님의 몸을 건강하고 아름답게 만들어 드리는 것을 목표로 합니다. 함께 즐겁게 운동하며 목표를 달성해봐요!",
        certificates: ["생활체육지도사 1급", "운동처방사", "NSCA-CPT"],
        totalTraineeCount: 1247,
        totalAverageRating: 4.8,
      },
    };
  },
};
// --- 모의 함수 끝 ---

const trainerData = reactive({
  username: "로딩 중...",
  userProfileUrl: profileDefault,
  career: "",
  certificates: [],
  totalTraineeCount: 0,
  totalAverageRating: 0.0,
});

const showTooltip = ref(false);

const fetchTrainerInfo = async () => {
  try {
    const response = await trainerMyPageApi.getTrainerInfo();
    const { userProfileUrl, ...otherData } = response.data;
    if (userProfileUrl) {
      trainerData.userProfileUrl = userProfileUrl;
    }
    Object.assign(trainerData, otherData);
  } catch (error) {
    console.error("트레이너 정보 조회 실패:", error);
  }
};

onMounted(() => {
  fetchTrainerInfo();
});

const trainingList = ref([
  { id: 1, title: "강좌이름1강좌이름1", level: "초급" },
  { id: 2, title: "강좌이름2강좌이름2", level: "중급" },
  { id: 3, title: "강좌이름3강좌이름3", level: "고급" },
  { id: 4, title: "강좌이름4강좌이름4", level: "중급" },
]);

const levelClass = (level) => {
  switch (level) {
    case "초급":
      return "bg-blue-100 text-blue-800";
    case "중급":
      return "bg-green-100 text-green-800";
    case "고급":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const goToTrainingDetail = (trainingId) => {
  console.log(`트레이닝 ${trainingId} 상세 페이지로 이동`);
};
</script>

<template>
  <div class="min-h-screen pb-10 pt-4 text-white">
    <div class="px-5 py-6">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <!-- 프로필 이미지 배경 및 테두리 색상 변경 -->
          <div
            class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100"
          >
            <img
              :src="trainerData.userProfileUrl || profileDefault"
              alt="프로필"
              class="h-full w-full object-cover"
            />
          </div>
        </div>

        <div class="mt-2 min-w-0 flex-1">
          <div class="flex items-center gap-3">
            <span class="truncate text-2xl font-bold">{{
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
              <!-- 인증 뱃지 스타일 -->
              <span
                class="flex cursor-default items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-black"
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
                    class="min-w-max rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-lg"
                  >
                    <div class="text-gray-600">
                      {{ trainerData.certificates.join(", ") }}
                    </div>
                    <div
                      class="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-b-4 border-transparent border-b-white"
                    ></div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <span class="flex items-center gap-1.5 text-white">
              <span class="font-bold">👤</span>
              수강생 {{ trainerData.totalTraineeCount.toLocaleString() }}명
            </span>
            <span class="text-gray-300">|</span>
            <span class="flex items-center gap-1">
              <img :src="starIcon" alt="별점" class="h-4 w-4" />
              <span class="font-medium text-white">{{
                trainerData.totalAverageRating.toFixed(1)
              }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="py-4">
      <TrainerCareerDisplay :career="trainerData.career" />
    </div>

    <div class="mt-4 px-5 py-4">
      <TrainingList :courses="trainingList" />
    </div>
  </div>
</template>
