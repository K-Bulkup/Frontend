<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getTraineeTrainingPreDetail } from "@/composables/api/trainee/training/traineeTrainingPreDetailAPI";
import { traineeTrainingPayment } from "@/composables/api/trainee/training/traineeTrainingPaymentAPI";
import { getReviews } from "@/composables/api/useReviewApi";

import profileDefault from "@/assets/images/mascot/profile.png";

import PaymentModal from "@/components/common/PaymentModal.vue";
import ReviewList from "@/components/common/ReviewList.vue";

import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseBadge from "@/components/common/BaseBadge.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const trainingData = ref(null);
const reviewList = ref([]);
const modalVisible = ref(false);

// 로그인 유저 ID 동적 적용
const userId = authStore.userId || 0;
const merchantUid = "order_" + new Date().getTime();

// 트레이닝 상세 API 호출
const loadTrainingDetail = async () => {
  const trainingId = route.params.trainingId;

  try {
    const res = await getTraineeTrainingPreDetail(route.params.trainingId);
    const raw = res.data.data;

    trainingData.value = {
      level: raw.level,
      category: raw.category,
      reward: `${raw.totalRoutineScore}P`,
      trainerName: raw.trainerNickname || "트레이너명 준비중",
      trainerId: raw.trainerID,
      trainerProfileUrl: raw.trainerProfileUrl,
      trainerId: raw.trainerId,
      trainerRating: raw.averageRating,
      studentCount: raw.traineeCount,
      totalWeeks: 4,
      title: raw.title,
      description: raw.description,
      price: raw.price,
      thumbnailUrl: raw.thumbnailUrl,
    };
  } catch (err) {
    console.error("🚨 결제 전 트레이닝 상세 조회 실패:", err);
  }

  // 리뷰 목록 가져오기
  try {
    const response = await getReviews(trainingId);
    if (response.success) {
      reviewList.value = response.data.map((review, index) => ({
        id: index,
        author: review.username,
        rating: review.rating,
        content: review.content,
      }));
    } else {
      console.error("리뷰 데이터를 불러오는데 실패했습니다:", response.message);
    }
  } catch (error) {
    console.error("리뷰 API 호출 중 에러 발생:", error);
    reviewList.value = [];
  }
};
onMounted(loadTrainingDetail);

// 가격 포맷
const formattedPrice = computed(() =>
  trainingData.value ? trainingData.value.price.toLocaleString() : "",
);

// --- 메서드 (Methods) ---

// 뒤로가기
const goBack = () => {
  router.back();
};

// 트레이너 상세 페이지로 이동
const goToTrainerPage = () => {
  if (trainingData.value.trainerId) {
    router.push(`/trainee/trainer/${trainingData.value.trainerId}`);
  } else {
    console.error("이동할 트레이너의 ID가 없습니다.");
  }
};

// 결제 버튼 → 모달 열기
const proceedToPayment = () => {
  modalVisible.value = true;
};

// PortOne SDK 결제 호출
const handlePayment = async (pg) => {
  modalVisible.value = false;

  const IMP = window.IMP;
  if (!IMP) {
    alert(
      "❌ PortOne SDK가 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.",
    );
    return;
  }

  IMP.init("imp13063177"); // 실제 가맹점 코드 입력 필요

  IMP.request_pay(
    {
      pg, // 선택된 PG사
      pay_method: "card",
      merchant_uid: merchantUid,
      name: trainingData.value?.title || "트레이닝 결제",
      amount: trainingData.value?.price || 0,
      buyer_name: authStore.user?.name || "사용자",
      buyer_email: authStore.user?.email || "user@example.com",
    },
    async (rsp) => {
      if (rsp.success) {
        try {
          const payload = {
            impUid: rsp.imp_uid, // 실제 imp_uid
            merchantUid,
            trainingId: route.params.trainingId,
            userId,
          };

          const res = await traineeTrainingPayment(payload);
          console.log("✅ 결제 응답:", res.data);
          alert("✅ 결제 완료: " + res.data.data.message);
          router.replace(`/trainee/mypage/training/${route.params.trainingId}`);
        } catch (err) {
          console.error("❌ 백엔드 결제 API 오류:", err);
          alert("❌ 결제 처리 중 오류 발생");
        }
      } else {
        alert("❌ 결제가 취소되었습니다.");
      }
    },
  );
};
</script>

<template>
  <div
    class="flex min-h-screen flex-col overflow-y-auto bg-realBlack px-6 pb-20 pt-4"
  >
    <main v-if="trainingData">
      <BaseHeader title="트레이닝 상세" @back="goBack" />

      <div class="mt-4 flex items-center gap-2">
        <BaseBadge>{{ trainingData.level }}</BaseBadge>
        <BaseBadge>{{ trainingData.category }}</BaseBadge>
        <BaseBadge variant="primary" class="ml-auto">
          총 리워드 {{ trainingData.reward }}
        </BaseBadge>
      </div>

      <div
        class="mt-6 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-800"
      >
        <img
          :src="trainingData.thumbnailUrl"
          alt="트레이닝 썸네일"
          class="h-full w-full object-cover"
        />
      </div>

      <div class="mt-6 flex items-center justify-between">
        <div
          @click="goToTrainerPage"
          class="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-800"
        >
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-700"
          >
            <img
              v-if="trainingData.trainerProfileUrl"
              :src="trainingData.trainerProfileUrl"
              alt="프로필"
              class="h-full w-full object-cover"
            />
            <img
              v-else
              :src="profileDefault"
              alt="기본 프로필"
              class="h-full w-full"
            />
          </div>
          <p class="font-bold text-white">{{ trainingData.trainerName }}</p>
        </div>

        <div class="flex items-center gap-2 text-caption text-gray-200">
          <div class="flex items-center gap-1">
            <img src="@/assets/images/star.svg" alt="별점" class="h-3 w-3" />
            <span>{{ trainingData.trainerRating }}</span>
          </div>
          <span>|</span>
          <span>{{ trainingData.studentCount }}명 수강</span>
          <span>|</span>
          <span>{{ trainingData.totalWeeks }}주</span>
        </div>
      </div>

      <h2 class="mt-5 text-heading font-bold text-white">
        {{ trainingData.title }}
      </h2>
      <p class="mt-2 text-body text-gray-300">{{ trainingData.description }}</p>

      <div class="mb-4 mt-8 h-px bg-gray-800"></div>
      <ReviewList :reviews="reviewList" />
      <div class="my-6 h-px bg-gray-800"></div>

      <div class="text-title font-bold text-white">{{ formattedPrice }}원</div>

      <div class="mt-12 pb-8">
        <button
          @click="proceedToPayment"
          class="h-14 w-full rounded-xl bg-white text-lg font-bold text-black active:bg-gray-200"
        >
          결제하기
        </button>
      </div>
    </main>

    <PaymentModal
      :visible="modalVisible"
      @close="modalVisible = false"
      @select="handlePayment"
    />
  </div>
</template>
