<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAccountConnect } from "@/composables/asset/useCreateAsset";
import { awaitUserReady } from "@/composables/user/awaitUserReady";
import ConnectSuccessModal from "@/components/common/ConnectSuccessModal.vue";
import ConnectFailureModal from "@/components/common/ConnectFailureModal.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";

const router = useRouter();
const { connectAccount } = useAccountConnect();

const selectedBanks = ref([]); // 다중 선택용
const selectedBank = ref(null); // 마지막 클릭한 은행 1개
const isLoading = ref(false);
const showSuccessModal = ref(false);
const showFailureModal = ref(false);

// ✅ userId 비동기로 가져오기
const userId = ref(null);
onMounted(async () => {
  userId.value = await awaitUserReady();
});

const banks = [
  {
    id: "kookmin",
    name: "국민은행",
    logo: new URL("@/assets/images/banks/kookmin.svg", import.meta.url).href,
  },
  {
    id: "shinhan",
    name: "신한은행",
    logo: new URL("@/assets/images/banks/shinhan.png", import.meta.url).href,
  },
  {
    id: "woori",
    name: "우리은행",
    logo: new URL("@/assets/images/banks/woori.svg", import.meta.url).href,
  },
  {
    id: "ibk",
    name: "기업은행",
    logo: new URL("@/assets/images/banks/ibk.svg", import.meta.url).href,
  },
  {
    id: "nonghyup",
    name: "농협은행",
    logo: new URL("@/assets/images/banks/nonghyub.svg", import.meta.url).href,
  },
  {
    id: "hana",
    name: "하나은행",
    logo: new URL("@/assets/images/banks/hana.svg", import.meta.url).href,
  },
];

const selectBank = (bank) => {
  const index = selectedBanks.value.findIndex((b) => b.id === bank.id);

  if (index >= 0) {
    selectedBanks.value.splice(index, 1); // 이미 있으면 제거
  } else {
    selectedBanks.value.push(bank); // 없으면 추가
  }

  // ✅ 선택된 은행이 없으면 null 처리
  if (selectedBanks.value.length === 0) {
    selectedBank.value = null;
  } else {
    selectedBank.value = selectedBanks.value[selectedBanks.value.length - 1]; // 마지막 선택 은행
  }
};

const goBack = () => {
  router.back();
};

const cancel = () => {
  router.back();
};

const onClickConnect = async () => {
  isLoading.value = true;

  try {
    const result = await connectAccount(selectedBank.value);

    if (!result.success) {
      showFailureModal.value = true;
      return;
    }

    showSuccessModal.value = true;
  } catch (error) {
    console.error("계좌 연결 중 에러:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleRetry = () => {
  showFailureModal.value = false;
};

const handleSuccessClose = () => {
  showSuccessModal.value = false;
  router.push("/trainee/asset");
};
</script>

<template>
  <!-- Header -->
  <div class="mb-8 px-4 pt-4 md:mb-10">
    <BaseHeader title="자산 정보 입력" @back="goBack" />
  </div>

  <!-- Main Content -->
  <div class="flex-1 justify-items-center px-4">
    <!-- Title Section -->
    <div class="mb-12 mt-6 text-center">
      <h2 class="mb-2 text-[18px] font-semibold text-white">
        안전한 자산 연결
      </h2>
      <p class="text-[14px] text-gray-300">
        자산 정보를 불러오기 위해 은행 정보를 입력해주세요
      </p>
    </div>

    <!-- Bank Selection Grid -->
    <!-- 부모: 칸 안에서 아이템을 중앙 배치 -->
    <div class="mb-8 grid grid-cols-3 gap-4">
      <div
        v-for="bank in banks"
        :key="bank.id"
        @click="selectBank(bank)"
        class="flex size-[92px] cursor-pointer flex-col items-center justify-center rounded-xl bg-[#353535]/50"
        :class="{
          'ring-2 ring-primary': selectedBanks.some((b) => b.id === bank.id),
        }"
      >
        <img
          :src="bank.logo"
          :alt="bank.name + ' 로고'"
          class="mb-1 h-8 w-8 object-contain"
        />
        <span class="text-center text-[10px] font-normal text-gray-200">{{
          bank.name
        }}</span>
      </div>
    </div>

    <!-- Security Notice -->
    <div class="mb-8 rounded-xl bg-gray-900 p-5">
      <div class="mb-4 flex items-center">
        <img
          src="@/assets/images/kbulkup-logo.png"
          alt="kbulkup-logo"
          class="h-10 w-10"
        />
        <h3 class="text-[14px] font-semibold text-white">보안 안내</h3>
      </div>
      <div class="space-y-3 text-[12px] text-white">
        <p>• 계좌 정보는 256비트 SSL 암호화로 안전하게 보호됩니다.</p>
        <p>• 자산 조회 목적으로만 사용되며, 출금이나 이체는 불가능합니다.</p>
        <p>• 언제든지 연결을 해제하고 정보를 삭제할 수 있습니다.</p>
        <p>• 금융감독원 가이드라인을 준수하여 운영됩니다.</p>
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="mb-6 flex gap-4 px-4">
    <button
      @click="cancel"
      class="h-14 flex-1 rounded-xl bg-gray-600 text-body font-semibold text-white"
    >
      취소
    </button>

    <button
      @click="onClickConnect"
      :disabled="!selectedBank"
      class="h-14 flex-1 rounded-xl text-body font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      :class="
        selectedBank
          ? 'bg-primary text-realBlack hover:brightness-110 active:scale-95'
          : 'bg-gray-900 text-gray-400'
      "
    >
      연동하기
    </button>
  </div>

  <!-- 모달 -->
  <LoadingOverlay
    :show="isLoading"
    title="자산 연동 중입니다."
    @close="isLoading = false"
  />
  <ConnectSuccessModal
    v-if="showSuccessModal"
    title="자산 연동에 성공했습니다"
    @close="handleSuccessClose"
  />
  <ConnectFailureModal
    v-if="showFailureModal"
    title="자산 연동에 실패했습니다"
    @retry="handleRetry"
  />
</template>
