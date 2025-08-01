<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAccountConnect } from "@/composables/asset/useCreateAsset";
import { awaitUserReady } from "@/composables/user/awaitUserReady";
import ConnectSuccessModal from "@/components/common/ConnectSuccessModal.vue";
import ConnectFailureModal from "@/components/common/ConnectFailureModal.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";

const router = useRouter();
const { connectAccount } = useAccountConnect();

const selectedBanks = ref([]); // 다중 선택용
const selectedBank = ref(null); // 마지막 클릭한 은행 1개

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
    logo: new URL("@/assets/images/banks/shinhan.svg", import.meta.url).href,
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
    logo: new URL("@/assets/images/banks/nonghyup.svg", import.meta.url).href,
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
  const result = await connectAccount(userId.value, selectedBank.value);

  if (!result.success) {
    showFailureModal.value = true;
    return;
  }

  showSuccessModal.value = true;
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
  <div class="flex min-h-screen flex-col bg-realBlack px-6 pb-20 pt-10">
    <!-- Header -->
    <BaseHeader title="계좌 정보 입력" @back="goBack" />

    <!-- Main Content -->
    <div class="flex-1">
      <div class="rounded-2xl bg-gray-800 p-8 shadow-lg">
        <!-- Title Section -->
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-heading font-semibold text-white">
            안전한 계좌 연결
          </h2>
          <p class="text-subtext text-gray-50">
            자산 정보를 불러오기 위해<br />
            계좌 정보를 입력해주세요
          </p>
        </div>

        <!-- Bank Selection Grid -->
        <div class="mb-8 grid grid-cols-3 gap-4">
          <div
            v-for="bank in banks"
            :key="bank.id"
            @click="selectBank(bank)"
            class="flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-700 bg-white transition-all duration-200"
            :class="{
              'ring-2 ring-primary': selectedBanks.some(
                (b) => b.id === bank.id,
              ),
            }"
          >
            <img
              :src="bank.logo"
              :alt="bank.name + ' 로고'"
              class="mb-2 h-8 w-8 object-contain"
            />
            <span class="text-extra text-gray-700">{{ bank.name }}</span>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="mb-8 rounded-xl bg-gray-50 p-6">
          <div class="mb-6 flex items-center">
            <div class="mr-3 h-4 w-4">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10C8.6 10 9 10.4 9 11C9 11.6 8.6 12 8 12ZM9 8.5C9 8.8 8.8 9 8.5 9H7.5C7.2 9 7 8.8 7 8.5V4.5C7 4.2 7.2 4 7.5 4H8.5C8.8 4 9 4.2 9 4.5V8.5Z"
                  fill="#4CAF50"
                />
              </svg>
            </div>
            <h3 class="text-subtext font-semibold text-black">보안 안내</h3>
          </div>
          <div class="space-y-3 text-extra text-gray-700">
            <p>• 계좌 정보는 256비트 SSL 암호화로 안전하게 보호됩니다.</p>
            <p>
              • 자산 조회 목적으로만 사용되며, 출금이나 이체는 불가능합니다.
            </p>
            <p>• 언제든지 연결을 해제하고 정보를 삭제할 수 있습니다.</p>
            <p>• 금융감독원 가이드라인을 준수하여 운영됩니다.</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button
            @click="cancel"
            class="h-14 flex-1 rounded-xl border-2 border-gray-700 bg-white text-body font-semibold text-black"
          >
            취소
          </button>
          <button
            @click="onClickConnect"
            :disabled="!selectedBank"
            class="h-14 flex-1 rounded-xl bg-white text-body font-semibold text-realBlack disabled:cursor-not-allowed disabled:opacity-50"
          >
            연결하기
          </button>
        </div>
      </div>
    </div>

    <!-- 모달 -->
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
  </div>
</template>
