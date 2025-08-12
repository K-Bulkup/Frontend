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

// 차트 선택 상태 관리
const selectedView = ref('composition'); // 'composition', 'trend', 'transactions'
const isExpanded = ref(false); // 차트 선택 목록 확장/접기 상태

const viewOptions = [
  { id: 'composition', title: '자산 구성' },
  { id: 'trend', title: '자산 추이' },
  { id: 'withdrawal', title: '지출 카테고리' },
  { id: 'transactions', title: '거래 내역' }
];

const setSelectedView = (viewId) => {
  selectedView.value = viewId;
  isExpanded.value = false; // 선택 후 접기
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

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

    <div class="flex-1 overflow-y-auto px-4 pb-32 pt-6">
      <!-- 데이터가 있을 때 -->
      <div v-if="hasAsset" class="space-y-4">
        <!-- Total Assets Section -->
        <div class="rounded-xl bg-gray-800 p-4 shadow-lg">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <img
                src="@/assets/images/mascot/keumyook.png"
                alt="keumyook"
                class="h-10 w-10"
              />
              <div>
                <p class="text-caption text-gray-300">총 자산</p>
                <p class="text-title font-bold text-white">
                  {{ balance.toLocaleString() }} 원
                </p>
              </div>
            </div>

            <!-- 단일 버튼: 없으면 불러오기 / 있으면 갱신하기 -->
            <button
              v-if="!isLoading"
              @click="handleAssetButton"
              class="rounded-full bg-gray-600 px-4 py-2 text-caption font-normal text-white"
            >
              자산 갱신하기
            </button>
          </div>

          <div class="mt-4 flex items-center space-x-3">
            <img
              src="@/assets/images/mascot/keumyook.png"
              alt="keumyook"
              class="h-10 w-10"
            />
            <div>
              <p class="text-caption text-gray-300">8월에 쓴 돈</p>
              <p class="text-title font-bold text-white">
                298,000 원
              </p>
            </div>
          </div>
        </div>

        <!-- 차트 선택 영역 -->
        <div>
          <!-- 접혀있을 때: 현재 선택된 항목만 표시 -->
          <div v-if="!isExpanded" class="rounded-xl bg-gray-800 p-4 shadow-lg">
            <div class="flex items-center justify-between">
              <span class="text-subtext text-white">{{ viewOptions.find(v => v.id === selectedView)?.title }}</span>
              <button @click="toggleExpanded" class="text-primary">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 펼쳐졌을 ��: 모든 선택 옵션 표시 -->
          <div v-else class="space-y-1">
            <button
              v-for="option in viewOptions"
              :key="option.id"
              @click="setSelectedView(option.id)"
              class="flex w-full items-center justify-center rounded-xl border-2 p-3 text-subtext transition-all"
              :class="{
                'border-primary bg-primary bg-opacity-20 text-white': selectedView === option.id,
                'border-gray-600 bg-gray-600 text-white hover:border-gray-500': selectedView !== option.id
              }"
            >
              {{ option.title }}
            </button>
          </div>
        </div>

        <!-- 차트 컨텐츠 영역 (접혀있을 때만 표시) -->
        <div v-if="!isExpanded" class="rounded-xl bg-gray-800 p-6 shadow-lg min-h-[300px]">
          <!-- 자산 구성 차트 -->
          <div v-if="selectedView === 'composition'" class="p-6">
            <div class="flex items-center justify-center">
              <CompositionDonutChart
                :composition="assetData?.composition ?? null"
                :balance="balance"
              />
            </div>
          </div>

          <!-- 자산 추이 차트 -->
          <div v-else-if="selectedView === 'trend'" class="flex h-48 items-center justify-center text-gray-300">
            <template v-if="assetData?.snapshots?.length">
              <BalanceLineChart :assetData="assetData" />
            </template>
            <template v-else>
              <span class="text-sm text-subtext text-gray-300"
                >자산 추이 데이터가 없습니다.</span
              >
            </template>
          </div>

          <!-- 지출 카테고리 차트 -->
          <div v-else-if="selectedView === 'withdrawal'" class="flex items-center justify-center">
            <WithdrawalDonutChart
              :transactions="assetData?.transactions ?? []"
            />
          </div>

          <!-- 거래 내역 -->
          <div v-else-if="selectedView === 'transactions'">
            <div class="space-y-4">
              <template v-if="assetData?.transactions?.length">
                <div
                  v-for="(transaction, index) in assetData.transactions.slice(0, 6)"
                  :key="index"
                  class="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0"
                >
                  <div>
                    <p class="text-caption text-gray-300">{{ transaction.date || '2025.07.15' }}</p>
                    <p class="text-body font-semibold text-white">{{ transaction.category || '생필품' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-body font-semibold text-white">
                      출금 {{ (transaction.amount || 1300).toLocaleString() }}원
                    </p>
                  </div>
                </div>
              </template>
              <template v-else>
                <!-- 샘플 거래 내역 데이터 -->
                <div class="flex items-center justify-between py-3 border-b border-gray-700">
                  <div>
                    <p class="text-caption text-gray-300">2025.07.15</p>
                    <p class="text-body font-semibold text-white">생필품</p>
                  </div>
                  <div class="text-right">
                    <p class="text-body font-semibold text-white">출금 1,300원</p>
                  </div>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-700">
                  <div>
                    <p class="text-caption text-gray-300">2025.07.15</p>
                    <p class="text-body font-semibold text-white">교통비</p>
                  </div>
                  <div class="text-right">
                    <p class="text-body font-semibold text-white">출금 1,300원</p>
                  </div>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-700">
                  <div>
                    <p class="text-caption text-gray-300">2025.07.15</p>
                    <p class="text-body font-semibold text-white">주거/공과금</p>
                  </div>
                  <div class="text-right">
                    <p class="text-body font-semibold text-white">출금 1,300원</p>
                  </div>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-700">
                  <div>
                    <p class="text-caption text-gray-300">2025.07.15</p>
                    <p class="text-body font-semibold text-white">의료/건강</p>
                  </div>
                  <div class="text-right">
                    <p class="text-body font-semibold text-white">출금 1,300원</p>
                  </div>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-700">
                  <div>
                    <p class="text-caption text-gray-300">2025.07.15</p>
                    <p class="text-body font-semibold text-white">의료/��강</p>
                  </div>
                  <div class="text-right">
                    <p class="text-body font-semibold text-white">출금 1,300원</p>
                  </div>
                </div>
                <div class="flex items-center justify-between py-3">
                  <div>
                    <p class="text-caption text-gray-300">2025.07.15</p>
                    <p class="text-body font-semibold text-white">의료/건강</p>
                  </div>
                  <div class="text-right">
                    <p class="text-body font-semibold text-white">출금 1,300원</p>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 데이터가 없을 때 -->
      <div v-else class="space-y-4">
        <!-- Total Assets Section with no data -->
        <div class="rounded-xl bg-gray-800 p-4 shadow-lg">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <img
                src="@/assets/images/mascot/keumyook.png"
                alt="keumyook"
                class="h-10 w-10"
              />
              <div>
                <p class="text-caption text-gray-300">총 자산</p>
                <p class="text-title font-bold text-white">0 원</p>
              </div>
            </div>

            <button
              v-if="!isLoading"
              @click="handleAssetButton"
              class="rounded-full bg-gray-600 px-4 py-2 text-caption font-normal text-white"
            >
              자산 갱신하기
            </button>
          </div>

          <div class="mt-4 flex items-center space-x-3">
            <img
              src="@/assets/images/mascot/keumyook.png"
              alt="keumyook"
              class="h-10 w-10"
            />
            <div>
              <p class="text-caption text-gray-300">8월에 쓴 돈</p>
              <p class="text-title font-bold text-white">0 원</p>
            </div>
          </div>
        </div>

        <!-- No Data Section -->
        <div class="rounded-xl bg-gray-800 p-6 shadow-lg">
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <p class="mb-2 text-body font-semibold text-white">
              자산 데이터가 없습니다.
            </p>
            <p class="mb-8 text-body text-white">
              자산 데이터를 연동해주세요.
            </p>

            <div class="mb-6">
              <img
                src="@/assets/images/mascot/nodata.png"
                alt="No data character"
                class="h-76 w-52 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- AI 채팅 버튼 -->
      <div
        class="fixed bottom-[120px] z-50"
        style="right: max(1rem, calc(50vw - 180px))"
      >
        <button
          @click="goToAiChat"
          class="flex h-15 w-15 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <span class="text-body font-semibold text-black">AI</span>
        </button>
      </div>
    </div>
  </div>
</template>
