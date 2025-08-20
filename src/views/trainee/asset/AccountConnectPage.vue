<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAccountConnect } from "@/composables/asset/useCreateAsset";
import { awaitUserReady } from "@/composables/user/awaitUserReady";

import ActionModal from "@/components/common/ActionStateModal.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";
import failImage from "@/assets/images/fail.svg";

const router = useRouter();
const { connectAccount } = useAccountConnect();

const selectedBanks = ref([]);
const selectedBank = ref(null);
const isLoading = ref(false);
const showSuccessModal = ref(false);
const showFailureModal = ref(false);

// userId (필요 시 payload에 포함)
const userId = ref(null);
onMounted(async () => {
  userId.value = await awaitUserReady();
});

// ---------- 계좌번호 ----------
const accountNumber = ref("");

// BaseFormField가 v-model을 emit할 때 들어오는 값을 숫자만으로 정제
const onAccountInput = (val) => {
  accountNumber.value = (val ?? "").replace(/\D/g, "");
};

// 8자리 이상 숫자만 허용
const isAccountNumberValid = computed(() =>
  /^\d{8,}$/.test(accountNumber.value),
);

// ---------- 은행 목록 ----------
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
  if (index >= 0) selectedBanks.value.splice(index, 1);
  else selectedBanks.value.push(bank);

  selectedBank.value = selectedBanks.value.length
    ? selectedBanks.value[selectedBanks.value.length - 1]
    : null;
};

const goBack = () => router.back();
const cancel = () => router.back();

const onClickConnect = async () => {
  if (!selectedBank.value || !isAccountNumberValid.value) return;

  isLoading.value = true;
  try {
    const result = await connectAccount({
      bank: selectedBank.value,
      accountNumber: accountNumber.value, // 숫자만 전달
    });

    if (!result.success) {
      showFailureModal.value = true;
      return;
    }
    showSuccessModal.value = true;
  } catch (error) {
    console.error("계좌 연결 중 에러:", error);
    showFailureModal.value = true;
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
  <BaseHeader title="자산 정보 입력" @back="goBack" />

  <!-- Main -->
  <div class="flex-1 px-4">
    <!-- Title -->
    <div class="mx-auto mb-10 mt-6 max-w-md text-center">
      <h2 class="mb-2 text-[18px] font-semibold text-white">
        안전한 자산 연결
      </h2>
      <p class="text-[14px] text-gray-300">
        자산 정보를 불러오기 위해 은행 정보를 입력해주세요
      </p>
    </div>

    <!-- Banks -->
    <div class="mx-auto mb-8 grid max-w-md grid-cols-3 gap-4">
      <div
        v-for="bank in banks"
        :key="bank.id"
        @click="selectBank(bank)"
        class="flex size-[92px] cursor-pointer flex-col items-center justify-center rounded-xl bg-[#353535]/50 transition"
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

    <!-- Account + Notice (간격 넉넉하게) -->
    <div class="mx-auto max-w-md">
      <!-- Account -->
      <div class="mb-12">
        <BaseFormField
          v-model="accountNumber"
          @update:modelValue="onAccountInput"
          label="계좌번호"
          placeholder="숫자만, 8자리 이상 입력해주세요."
          variant="dark"
          class="h-14 w-full"
          inputmode="numeric"
          pattern="[0-9]*"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          aria-label="계좌번호"
        />
        <p
          v-if="accountNumber && !isAccountNumberValid"
          class="mt-3 text-[12px] text-red-400"
        >
          계좌번호는 숫자 기준 8자리 이상이어야 합니다.
        </p>
      </div>

      <!-- Security Notice -->
      <div class="mb-10 rounded-xl bg-gray-900 p-5">
        <div class="mb-4 flex items-center">
          <img
            src="@/assets/images/shiledCheck.png"
            alt="shiledCheck"
            class="h-10 w-7"
          />
          <h3 class="ml-1 text-[14px] font-semibold text-white">보안 안내</h3>
        </div>
        <div class="space-y-3 text-[12px] text-white">
          <p>• 계좌 정보는 256비트 SSL 암호화로 안전하게 보호됩니다.</p>
          <p>• 자산 조회 목적으로만 사용되며, 출금이나 이체는 불가능합니다.</p>
          <p>• 언제든지 연결을 해제하고 정보를 삭제할 수 있습니다.</p>
          <p>• 금융감독원 가이드라인을 준수하여 운영됩니다.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="mx-auto mb-6 flex max-w-md gap-4 px-4">
    <button
      @click="cancel"
      class="h-14 flex-1 rounded-xl bg-gray-600 text-body font-semibold text-white"
    >
      취소
    </button>

    <button
      @click="onClickConnect"
      :disabled="!selectedBank || !isAccountNumberValid"
      class="h-14 flex-1 rounded-xl text-body font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      :class="
        selectedBank && isAccountNumberValid
          ? 'bg-primary text-realBlack hover:brightness-110 active:scale-95'
          : 'bg-gray-900 text-gray-400'
      "
    >
      연동하기
    </button>
  </div>

  <!-- Modals -->
  <LoadingOverlay
    :show="isLoading"
    title="자산 연동 중입니다."
    @close="isLoading = false"
  />
  <ActionModal
    v-if="showSuccessModal"
    title="자산 연동에 성공했습니다"
    @close="handleSuccessClose"
  />
  <ActionModal
    v-if="showFailureModal"
    title="자산 연동에 실패했습니다"
    confirmButtonText="재시도"
    :image-src="failImage"
    image-alt="fail"
    @close="handleRetry"
  />
</template>
