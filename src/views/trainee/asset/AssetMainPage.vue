<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useTraineeAsset } from "@/composables/asset/useFetchAsset.js";
import { awaitUserReady } from "@/composables/user/awaitUserReady";
import BalanceLineChart from "@/components/assetCharts/BalanceLineChart.vue";
import CompositionDonutChart from "@/components/assetCharts/CompositionDonutChart.vue";
import WithdrawalDonutChart from "@/components/assetCharts/WithdrawalDonutChart.vue";
import { updateAndGetTraineeAsset } from "@/composables/api/useAssetApi";
import plusGreen from "@/assets/images/plus_green.svg";
import logo from "@/assets/images/mascot/logo.png";

// Initialize composables at the very top
const router = useRouter();
const traineeAsset = useTraineeAsset();

// Extract values from composable
const getTraineeAsset = traineeAsset.getTraineeAsset;
const assetData = traineeAsset.assetData;
const errorMessage = traineeAsset.errorMessage;
const isLoading = traineeAsset.isLoading;

// Navigation functions
const goToAccountConnect = () => router.push("/trainee/asset/account");
const goToAiChat = () => router.push("/trainee/asset/ai-chat");

// Reactive data
const balance = ref(0);
const userId = ref(null);
const now = ref(new Date());
const currentYear = computed(() => now.value.getFullYear());
const currentMonth = computed(() => now.value.getMonth() + 1);

const currentMonthLabel = computed(() => `${currentMonth.value}월에 쓴 돈`);

// 이번 달 지출 합계(출금만)
const monthlySpent = computed(() => {
  const tx = assetData.value?.transactions ?? [];
  return tx
    .filter(
      (t) =>
        t.transactionType === "출금" &&
        Array.isArray(t.tranDate) &&
        t.tranDate[0] === currentYear.value &&
        t.tranDate[1] === currentMonth.value,
    )
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
});

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
const selectedView = ref("composition"); // 'composition', 'trend', 'transactions'
const isExpanded = ref(false); // 차트 선택 목록 확장/접기 상태

const viewOptions = [
  { id: "composition", title: "자산 구성" },
  { id: "trend", title: "자산 추이" },
  { id: "withdrawal", title: "지출 카테고리" },
  { id: "transactions", title: "거래 내역" },
];

const setSelectedView = (viewId) => {
  selectedView.value = viewId;
  isExpanded.value = false; // 선택 후 접기
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

// 날짜 배열 → Date
const toDate = (arr) => {
  if (!arr || arr.length < 3) return null;
  const [y, m, d] = arr;
  return new Date(y, m - 1, d);
};

// YYYY.MM.DD
const formatDate = (arr) => {
  const d = toDate(arr);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
};

// "주거_공과금" → "주거/공과금"
const formatCategory = (s) => (s ? s.replaceAll("_", "/") : "기타");

// 정렬 + 표시용 필드 추가
const txList = computed(() => {
  const list = assetData.value?.transactions ?? [];
  return [...list]
    .sort((a, b) => toDate(b.tranDate) - toDate(a.tranDate)) // 최신순
    .map((t) => ({
      ...t,
      dateText: formatDate(t.tranDate),
      categoryText: formatCategory(t.transactionCategory),
      amountText: t.amount?.toLocaleString?.() ?? String(t.amount ?? 0),
    }));
});

onMounted(async () => {
  userId.value = await awaitUserReady();
  const result = await getTraineeAsset(userId.value); // 최초 GET
  if (result?.success) refreshBalanceFromSnapshots();
  console.log("assetData:", assetData.value);
});
</script>

<template>
  <div class="mx-auto w-full max-w-[420px] overflow-y-auto px-4 pb-24 pt-2">
    <div
      class="relative mb-4 flex h-[101px] w-full items-center justify-between"
    >
      <img :src="logo" alt="KBULKUP" class="h-[87px] w-[87px]" />
      <button
        type="button"
        @click="goToAiChat"
        aria-label="채팅"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 text-primary shadow-md hover:bg-gray-900/40"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-6 w-6"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 3.5c-4.97 0-9 3.58-9 8 0 1.95.78 3.74 2.09 5.16a1 1 0 0 1 .24.67l-.08 1.84a.75.75 0 0 0 1.03.74l1.98-.79c.2-.08.43-.1.64-.06 1.01.22 2.07.34 3.1.34 4.97 0 9-3.58 9-8s-4.03-8-9-8Zm-6.5 8c0-3.31 3.14-6 7-6s7 2.69 7 6-3.14 6-7 6c-1 0-2.05-.12-3.06-.37-.46-.1-.95-.07-1.39.11l-1.06.43.04-.93c.02-.48-.16-.95-.5-1.31C6.78 13.5 5.5 11.83 5.5 11.5Z"
          />
        </svg>
      </button>
    </div>

    <!-- 자산 관리 섹션 -->
    <section class="mb-6">
      <div v-if="hasAsset" class="space-y-4">
        <!-- Total Assets Section -->
        <div class="rounded-xl bg-gray-900 p-4 shadow-lg">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <img
                src="@/assets/images/purse.png"
                alt="purse"
                class="h-10 w-10"
              />
              <div>
                <p class="text-body text-gray-300">총 자산</p>
                <p class="text-subTitle font-bold text-white">
                  {{ balance.toLocaleString() }} 원
                </p>
              </div>
            </div>

            <!-- 단일 버튼: 없으면 불러오기 / 있으면 갱신하기 -->
            <button
              v-if="!isLoading"
              @click="handleAssetButton"
              class="text-caption inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-gray-900 px-4 py-2 font-normal text-white"
            >
              <img
                :src="plusGreen"
                alt=""
                class="block h-4 w-4"
                aria-hidden="true"
              />
              <span class="text-button">자산 갱신</span>
            </button>
          </div>

          <div class="mt-4 flex items-center space-x-3">
            <img
              src="@/assets/images/receipt.png"
              alt="receipt"
              class="h-10 w-10"
            />
            <div>
              <p class="text-caption text-gray-300">{{ currentMonthLabel }}</p>
              <p class="text-subTitle font-bold text-white">
                {{ monthlySpent.toLocaleString() }} 원
              </p>
            </div>
          </div>
        </div>

        <!-- Modified chart selection area to use dropdown overlay instead of hiding chart -->
        <div class="relative">
          <!-- 현재 선택된 항목 표시 (항상 표시) -->
          <div class="rounded-xl bg-gray-900 p-4 shadow-lg">
            <div class="flex items-center justify-between">
              <span class="text-input text-white">{{
                viewOptions.find((v) => v.id === selectedView)?.title
              }}</span>
              <button @click="toggleExpanded" class="text-gray-300">
                <svg
                  class="h-6 w-6 transition-transform duration-200"
                  :class="{ '-rotate-90': isExpanded }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Dropdown overlay when expanded -->
          <div
            v-if="isExpanded"
            class="absolute left-0 right-0 top-full z-10 mt-1 space-y-1 rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-xl"
            role="menu"
            aria-label="금융 리포트 종류"
          >
            <!-- 헤더(설명): 버튼과 동일한 박스 크기 사용 (rounded-lg p-3) -->
            <div
              class="select-none rounded-lg bg-gray-800 p-3 text-center"
              aria-hidden="true"
            >
              <span class="text-heading font-semibold text-white"
                >금융 리포트 종류</span
              >
            </div>

            <!-- 옵션 리스트: 기존 버튼 박스 크기 유지 (rounded-lg p-3) -->
            <button
              v-for="option in viewOptions"
              :key="option.id"
              @click="setSelectedView(option.id)"
              class="text-subtext flex w-full items-center justify-center rounded-lg p-3 transition-all"
              :class="[
                selectedView === option.id
                  ? // 선택 상태: 진한 초록 배경 + 흰 글자, 외곽선 느낌의 얕은 그림자 (크기 영향 없음)
                    'bg-primary text-white shadow-[0_0_0_1px_rgba(34,228,129,0.6)]'
                  : // 기본/호버 상태: 기존 그레이, 호버 시 연한 초록 오버레이
                    'bg-gray-800 text-gray-300 hover:bg-primary/20 hover:text-white hover:shadow-[0_0_0_1px_rgba(34,228,129,0.6)]',
              ]"
              role="menuitemradio"
              :aria-checked="selectedView === option.id"
            >
              {{ option.title }}
            </button>
          </div>
        </div>

        <!-- Chart content area now always visible -->
        <div class="min-h-[300px] rounded-xl bg-gray-900 p-6 shadow-lg">
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
          <div
            v-else-if="selectedView === 'trend'"
            class="h-55 flex items-center justify-center text-gray-300"
          >
            <template v-if="assetData?.snapshots?.length">
              <BalanceLineChart :assetData="assetData" />
            </template>
            <template v-else>
              <span class="text-subtext text-sm text-gray-300"
                >자산 추이 데이터가 없습니다.</span
              >
            </template>
          </div>

          <!-- 지출 카테고리 차트 -->
          <div
            v-else-if="selectedView === 'withdrawal'"
            class="flex items-center justify-center"
          >
            <WithdrawalDonutChart
              :transactions="assetData?.transactions ?? []"
            />
          </div>

          <!-- 거래 내역 -->
          <div v-else-if="selectedView === 'transactions'">
            <div class="space-y-4">
              <template v-if="txList.length">
                <div
                  v-for="t in txList"
                  :key="t.transactionId"
                  class="flex items-center justify-between border-b border-gray-700 py-3 last:border-b-0"
                >
                  <div>
                    <p class="text-caption text-gray-300">{{ t.dateText }}</p>
                    <p class="text-body font-semibold text-white">
                      {{ t.categoryText }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p
                      class="text-body font-semibold"
                      :class="
                        t.transactionType === '입금'
                          ? 'text-primary'
                          : 'text-white'
                      "
                    >
                      {{ t.transactionType }} {{ t.amountText }}원
                    </p>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="text-subtext py-8 text-center text-gray-300">
                  거래 내역이 없습니다.
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 데이터가 없을 때 -->
      <div v-else class="space-y-4">
        <!-- Total Assets Section with no data -->
        <div class="rounded-xl bg-gray-900 p-4 shadow-lg">
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <img
                src="@/assets/images/purse.png"
                alt="purse"
                class="h-10 w-10"
              />
              <div>
                <p class="text-body text-gray-300">총 자산</p>
                <p class="text-subTitle font-bold text-white">0 원</p>
              </div>
            </div>

            <button
              v-if="!isLoading"
              @click="handleAssetButton"
              class="text-caption inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-gray-900 px-4 py-2 font-normal text-white"
            >
              <img
                :src="plusGreen"
                alt=""
                class="block h-4 w-4"
                aria-hidden="true"
              />
              <span class="text-button">자산 연동</span>
            </button>
          </div>

          <div class="mt-4 flex items-center space-x-3">
            <img
              src="@/assets/images/receipt.png"
              alt="receipt"
              class="h-10 w-10"
            />
            <div>
              <p class="text-body text-gray-300">{{ currentMonthLabel }}</p>
              <p class="text-subTitle font-bold text-white">0 원</p>
            </div>
          </div>
        </div>

        <!-- No Data Section -->
        <div
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <img
            src="@/assets/images/mascot/nodata.png"
            alt="No data character"
            class="mb-6 h-[180px] w-auto object-contain opacity-90"
          />
          <p class="mb-2 text-body font-bold text-white">
            자산 데이터가 없습니다.
          </p>
          <p class="text-body text-gray-300">자산 데이터를 연동해주세요.</p>
        </div>
      </div>
    </section>
  </div>
</template>
