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
const num = (v) => (v == null ? 0 : Number(v));

// ✅ 여러 형태 대비: user?.userId | user?.id | store.userId | localStorage
const resolvedUserId = computed(() => {
  const c =
    authStore?.user?.userId ??
    authStore?.user?.id ??
    authStore?.userId ??
    Number(localStorage.getItem("userId"));
  return Number.isFinite(Number(c)) ? Number(c) : 0;
});

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
      trainerId: raw.trainerId ?? raw.trainerID,
      trainerProfileUrl: raw.trainerProfileUrl,
      trainerRating: raw.averageRating,
      studentCount: num(
        raw.traineeCount ?? raw.enrolledTraineeCount ?? raw.totalTraineeCount,
      ),
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

// ✅ m_redirect_url 복귀 처리
const finalizeIfRedirected = async () => {
  const { imp_uid, merchant_uid, imp_success } = route.query;
  if (!imp_uid || !merchant_uid) return;

  // 재마운트시 재실행 방지: 쿼리 즉시 제거
  router.replace({ path: route.path, params: route.params });

  if (String(imp_success) !== "true") {
    console.warn("모바일 리다이렉트 결과: 실패/취소");
    alert("❌ 결제가 취소되었거나 실패했습니다.");
    return;
  }

  if (!resolvedUserId.value) {
    alert("로그인이 만료되었습니다. 다시 로그인 후 결제해주세요.");
    return;
  }

  try {
    const payload = {
      impUid: String(imp_uid),
      merchantUid: String(merchant_uid),
      trainingId: route.params.trainingId,
      userId: resolvedUserId.value, // ✅ 0 방지
    };
    const res = await traineeTrainingPayment(payload);
    alert("✅ 결제 완료: " + (res?.data?.data?.message || "성공"));
    router.replace(`/trainee/mypage/training/${route.params.trainingId}`);
  } catch (err) {
    console.error("❌ 리디렉션 후 결제 확정 API 오류:", err);
    alert("❌ 결제 처리 중 오류가 발생했습니다.");
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

// 🔁 PG→결제수단 매핑
const resolvePayMethod = (pg) => {
  if (pg?.startsWith("kakaopay")) return "kakaopay";
  if (pg?.startsWith("tosspayments")) return "tosspay";
  if (pg?.startsWith("payco")) return "payco";
  if (pg?.startsWith("html5_inicis")) return "card";
  return "kakaopay";
};

// PortOne SDK 결제 호출
const handlePayment = async (pg) => {
  modalVisible.value = false;

  if (!resolvedUserId.value) {
    alert("로그인이 만료되었습니다. 다시 로그인 후 결제해주세요.");
    return;
  }

  isLoading.value = true;

  const IMP = window.IMP;
  if (!IMP) {
    isLoading.value = false;
    alert(
      "❌ PortOne SDK가 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.",
    );
    return;
  }

  IMP.init("imp13063177"); // 테스트 가맹점 코드 유지

  const merchantUid = `order_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const mRedirectUrl = `${location.origin}${route.path}`;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  IMP.request_pay(
    {
      pg,
      pay_method: resolvePayMethod(pg),
      merchant_uid: merchantUid,
      name: trainingData.value?.title || "트레이닝 결제",
      amount: Number(trainingData.value?.price ?? 0),
      buyer_name: authStore.user?.name || "사용자",
      buyer_email: authStore.user?.email || "user@example.com",
      ...(isMobile ? { m_redirect_url: mRedirectUrl } : {}), // PC 콜백, 모바일 리다이렉트
    },
    async (rsp) => {
      if (rsp?.success) {
        try {
          const payload = {
            impUid: rsp.imp_uid,
            merchantUid,
            trainingId: route.params.trainingId,
            userId: resolvedUserId.value, // ✅ 0 방지
          };
          const res = await traineeTrainingPayment(payload);
          console.log("✅ 결제 응답:", res.data);
          alert("✅ 결제 완료: " + res.data.data.message);
          router.replace(`/trainee/mypage/training/${route.params.trainingId}`);
        } catch (err) {
          console.error("❌ 백엔드 결제 API 오류:", err);
          alert("❌ 결제 처리 중 오류 발생");
        } finally {
          isLoading.value = false;
        }
      } else {
        isLoading.value = false;
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

        <div class="text-caption flex items-center gap-2 text-gray-200">
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

      <h2 class="text-heading mt-5 font-bold text-white">
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
