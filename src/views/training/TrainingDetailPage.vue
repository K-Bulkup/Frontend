<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getTraineeTrainingPreDetail } from "@/composables/api/trainee/training/traineeTrainingPreDetailAPI";
import { traineeTrainingPayment } from "@/composables/api/trainee/training/traineeTrainingPaymentAPI";
import { getReviews } from "@/composables/api/useReviewApi";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";

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
const isLoading = ref(false);

// 로그인 유저 ID
const userId = authStore.userId || 0;

const loadTrainingDetail = async () => {
  const trainingId = route.params.trainingId;

  try {
    const res = await getTraineeTrainingPreDetail(trainingId);
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

// ✅ 리디렉션 복귀 처리 (m_redirect_url로 돌아왔을 때 결제 확정)
const finalizeIfRedirected = async () => {
  const { imp_uid, merchant_uid } = route.query;
  if (!imp_uid || !merchant_uid) return;

  try {
    const payload = {
      impUid: String(imp_uid),
      merchantUid: String(merchant_uid),
      trainingId: route.params.trainingId,
      userId,
    };
    const res = await traineeTrainingPayment(payload);
    alert("✅ 결제 완료: " + (res?.data?.data?.message || "성공"));
    router.replace(`/trainee/mypage/training/${route.params.trainingId}`);
  } catch (err) {
    console.error("❌ 리디렉션 후 결제 확정 API 오류:", err);
    alert("❌ 결제 처리 중 오류가 발생했습니다.");
    router.replace({ path: route.path, params: route.params });
  }
};

onMounted(async () => {
  await loadTrainingDetail();
  await finalizeIfRedirected();
});

const formattedPrice = computed(() =>
  trainingData.value ? trainingData.value.price.toLocaleString() : "",
);

const goBack = () => router.back();

const goToTrainerPage = () => {
  if (trainingData.value?.trainerId) {
    router.push(`/trainee/trainer/${trainingData.value.trainerId}`);
  } else {
    console.error("이동할 트레이너의 ID가 없습니다.");
  }
};

const proceedToPayment = () => {
  modalVisible.value = true;
};

// 🔁 QR/간편결제 최우선 매핑 (기본도 카카오 간편결제)
const resolvePayMethod = (pg) => {
  if (pg?.startsWith("kakaopay")) return "kakaopay"; // PC: QR, 모바일: 앱
  if (pg?.startsWith("tosspayments")) return "tosspay"; // 토스 간편결제
  if (pg?.startsWith("payco")) return "payco"; // 페이코 간편결제
  if (pg?.startsWith("html5_inicis")) return "card"; // 이니시스는 카드
  return "kakaopay"; // 기본도 QR 우선
};

// PortOne SDK 결제 호출
const handlePayment = async (pg) => {
  modalVisible.value = false;
  isLoading.value = true;

  const IMP = window.IMP;
  if (!IMP) {
    isLoading.value = false; // ⬅️ OFF
    alert(
      "❌ PortOne SDK가 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.",
    );
    return;
  }

  IMP.init("imp13063177"); // 테스트 가맹점 코드 유지

  // 클릭마다 고유 주문번호 생성(중복 방지)
  const merchantUid = `order_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

  // 웹앱/모바일 대응: 결제 후 현재 페이지로 복귀
  const mRedirectUrl = `${location.origin}${route.path}`;

  IMP.request_pay(
    {
      pg,
      pay_method: resolvePayMethod(pg), // ← QR/간편결제 우선
      merchant_uid: merchantUid,
      name: trainingData.value?.title || "트레이닝 결제",
      amount: Number(trainingData.value?.price ?? 0),
      buyer_name: authStore.user?.name || "사용자",
      buyer_email: authStore.user?.email || "user@example.com",
      m_redirect_url: mRedirectUrl, // SDK 1.1.8+ 모바일/리디렉션 필수
    },
    async (rsp) => {
      // PC 팝업 플로우일 땐 콜백으로 성공이 들어올 수도 있음
      if (rsp?.success) {
        try {
          const payload = {
            impUid: rsp.imp_uid,
            merchantUid,
            trainingId: route.params.trainingId,
            userId,
          };
          const res = await traineeTrainingPayment(payload);
          console.log("✅ 결제 응답:", res.data);
          alert("✅ 결제 완료: " + res.data.data.message);
          isLoading.value = false;
          router.replace(`/trainee/mypage/training/${route.params.trainingId}`);
        } catch (err) {
          console.error("❌ 백엔드 결제 API 오류:", err);
          isLoading.value = false;
          alert("❌ 결제 처리 중 오류 발생");
        }
      } else {
        isLoading.value = false;
        alert("❌ 결제가 취소되었습니다.");
      }
      // 모바일 리디렉션 플로우는 finalizeIfRedirected()에서 처리
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
          :disabled="isLoading"
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

    <LoadingOverlay :show="isLoading" title="결제 처리 중입니다" />
  </div>
</template>
