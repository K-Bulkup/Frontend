<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useTraineeAsset } from "@/composables/asset/useFetchAsset.js";
import { awaitUserReady } from "@/composables/user/awaitUserReady";
import BalanceLineChart from "@/components/assetCharts/BalanceLineChart.vue";
import CompositionDonutChart from "@/components/assetCharts/CompositionDonutChart.vue";
import WithdrawalDonutChart from "@/components/assetCharts/WithdrawalDonutChart.vue";
import BaseHeaderWithoutBack from "@/components/common/BaseHeaderWithoutBack.vue";
import { updateAndGetTraineeAsset } from "@/composables/api/useAssetApi";

const router = useRouter();
const { getTraineeAsset, assetData, errorMessage, isLoading } =
  useTraineeAsset();

const goToAccountConnect = () => router.push("/trainee/asset/account");
const goToAiChat = () => router.push("/trainee/asset/ai-chat");

const balance = ref(0);
const userId = ref(null);

// 자산 존재 여부
const hasAsset = computed(() => {
  const a = assetData.value;
  if (!a) return false;
  const hasSnapshots = Array.isArray(a.snapshots) && a.snapshots.length > 0;
  const hasTx = Array.isArray(a.transactions) && a.transactions.length > 0;
  const hasComp = !!a.composition;
  return hasSnapshots || hasTx || hasComp;
});

const refreshBalanceFromSnapshots = () => {
  if (assetData.value?.snapshots?.length > 0) {
    balance.value = assetData.value.snapshots[0].balance;
  } else {
    balance.value = 0;
  }
};

// 버튼: 자산 없으면 연결, 있으면 갱신(PUT) 후 재조회
const handleAssetButton = async () => {
  if (isLoading.value) return;

  if (!hasAsset.value) {
    return goToAccountConnect();
  }

  try {
    // axios 기준: res.data = { status, name, message, data, success }
    const res = await updateAndGetTraineeAsset(); // PUT
    assetData.value = res.data.data; // ← 재조회 없이 상태 갱신
    refreshBalanceFromSnapshots();
  } catch (e) {
    console.error(e);
    // 실패 시에만 백업으로 GET 호출
    await getTraineeAsset(userId.value);
    refreshBalanceFromSnapshots();
  }
};

const chartsReady = computed(() => hasAsset.value && !isLoading.value);

onMounted(async () => {
  userId.value = await awaitUserReady();
  const result = await getTraineeAsset(userId.value); // 최초 GET
  if (result?.success) refreshBalanceFromSnapshots();
  console.log("assetData:", assetData.value);
});
</script>

<template>
  <div>
    <BaseHeaderWithoutBack title="자산 관리" />

    <div class="flex-1 overflow-y-auto px-6 pb-32 pt-10">
      <div class="space-y-6">
        <!-- Total Assets Section -->
        <div class="rounded-xl bg-gray-100 p-6 shadow-lg">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="mb-2 text-heading font-semibold text-black">
                현재 자산
              </h2>
              <p class="text-title font-bold text-black">
                {{ balance.toLocaleString() }} 원
              </p>
            </div>

            <!-- 단일 버튼: 없으면 불러오기 / 있으면 갱신하기 -->
            <button
              v-if="!isLoading"
              @click="handleAssetButton"
              class="rounded-lg bg-primary px-4 py-2 text-subtext font-normal text-realBlack"
            >
              {{ hasAsset ? "자산 갱신하기" : "자산 불러오기" }}
            </button>
          </div>
        </div>

        <!-- 자산 구성 -->
        <div class="rounded-xl bg-gray-100 p-6 shadow-lg">
          <h3 class="mb-4 text-heading font-semibold text-black">자산 구성</h3>
          <div class="flex items-center justify-center">
            <CompositionDonutChart
              :composition="assetData?.composition ?? null"
              :balance="balance"
            />
          </div>
        </div>

        <!-- 자산 추이 -->
        <div class="rounded-xl bg-gray-100 p-6 shadow-lg">
          <h3 class="mb-4 text-heading font-semibold text-black">자산 추이</h3>
          <div class="flex h-32 items-center justify-center text-gray-700">
            <template v-if="assetData?.snapshots?.length">
              <BalanceLineChart :assetData="assetData" />
            </template>
            <template v-else>
              <span class="text-sm text-subtext text-gray-500"
                >자산 추이 데이터가 없습니다.</span
              >
            </template>
          </div>
        </div>

        <!-- 지출 카테고리 -->
        <div class="rounded-xl bg-gray-100 p-6 shadow-lg">
          <h3 class="mb-4 text-heading font-semibold text-black">
            지출 카테고리
          </h3>
          <div class="flex items-center justify-center">
            <WithdrawalDonutChart
              :transactions="assetData?.transactions ?? []"
            />
          </div>
        </div>

        <!-- AI 채팅 버튼 -->
        <div
          class="fixed bottom-[120px] z-50"
          style="right: max(1rem, calc(50vw - 180px))"
        >
          <button
            @click="goToAiChat"
            class="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <div class="relative">
              <svg
                width="30"
                height="24"
                viewBox="0 0 32 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-black stroke-2"
              >
                <path
                  d="M31 13C31 19.6274 24.2843 25 16 25C13.0482 25 10.2956 24.3179 7.97495 23.14L1 25L3.32498 19.42C1.85261 17.5635 1 15.3614 1 13C1 6.37258 7.71573 1 16 1C24.2843 1 31 6.37258 31 13Z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-body font-semibold text-black"
                >AI</span
              >
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
