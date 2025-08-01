<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useTraineeAsset } from "@/composables/asset/useFetchAsset.js";
import { awaitUserReady } from "@/composables/user/awaitUserReady";
import BalanceLineChart from "@/components/assetCharts/BalanceLineChart.vue";
import CompositionDonutChart from "@/components/assetCharts/CompositionDonutChart.vue";
import WithdrawalDonutChart from "@/components/assetCharts/WithdrawalDonutChart.vue";
import BaseHeaderWithoutBack from "@/components/common/BaseHeaderWithoutBack.vue";

const router = useRouter();
const { getTraineeAsset, assetData, errorMessage, isLoading } =
  useTraineeAsset();

const goToAccountConnect = () => {
  router.push("/trainee/asset/account");
};

const goToAiChat = () => {
  router.push("/trainee/asset/ai-chat");
};

const balance = ref(0);

onMounted(async () => {
  const id = await awaitUserReady();
  const result = await getTraineeAsset(id);

  if (result.success && assetData.value?.snapshots?.length > 0) {
    balance.value = assetData.value.snapshots[0].balance;
  }

  console.log("assetData:", assetData.value);
});

const isAssetFetched = computed(() => !!assetData.value);
</script>

<template>
  <div>
    <BaseHeaderWithoutBack title="자산 관리" />

    <!-- Main Content -->
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
            <button
              v-if="!isLoading && !isAssetFetched"
              @click="goToAccountConnect"
              class="rounded-lg bg-primary px-4 py-2 text-subtext font-normal text-realBlack"
            >
              자산 불러오기
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
        <!-- AI 채팅 버튼: 메인 화면 기준 오른쪽 하단 고정 -->
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
              >
                AI
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
