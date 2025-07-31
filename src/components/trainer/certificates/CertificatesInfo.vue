<script setup>
import BaseInput from "@/components/common/BaseInput.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseDropbox from "@/components/common/BaseDropdown.vue";

import ConnectFailureModal from "@/components/common/ConnectFailureModal.vue";
import ConnectSuccessModal from "@/components/common/ConnectSuccessModal.vue";

import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import { trainerMyPageApi } from "@/composables/api/trainer/mypage/trainerMypageApi";

const router = useRouter();

// 현재 보여줄 컴포넌트 상태
const currentComponent = ref(null);

// 모달 props
const modalProps = ref({
  title: "",
  subtitle: "",
  retryButtonText: "다시 시도",
});

const inputFields = ref([
  {
    id: "username",
    label: "이름",
    subLabel: "",
    placeholder: "이름을 입력해주세요.",
    value: "",
    requireExactLength: null,
  },
  {
    id: "successDocNo",
    label: "합격증 번호",
    subLabel: "('-' 없이)",
    placeholder: "합격증 번호를 입력해주세요 (8자리)",
    value: "",
    requireExactLength: 8,
  },
  {
    id: "birth",
    label: "생년월일",
    subLabel: "(6자리, 예: 19941225)",
    placeholder: "생년월일을 입력해주세요 (8자리)",
    value: "",
    requireExactLength: 8,
  },
  {
    id: "successCtfyNoLic",
    label: "발급 번호",
    subLabel: "(하단 발급번호의 마지막 6자리)",
    placeholder: "발급 번호를 입력해주세요 (6자리)",
    value: "",
    requireExactLength: 6,
  },
]);

const selectedCertificate = ref(null);

// 각 input의 유효성 검사
const isInvalid = (value, field) => {
  if (!value) return false;

  // 이름 필드는 유효성 검사 안 함
  if (field.id === "username") return false;

  // 숫자만 있는지 검사 (이름 제외)
  if (!/^[0-9]+$/.test(value)) return true;

  // 필드별 길이 검사
  if (field.requireExactLength && value.length !== field.requireExactLength) {
    return true;
  }

  return false;
};

const getErrorMessage = (value, field) => {
  if (!value) return "";

  // 이름 필드는 에러 메시지 없음
  if (field.id === "username") return "";

  if (!/^[0-9]+$/.test(value)) {
    return "숫자만 입력해주세요";
  }

  if (field.requireExactLength && value.length !== field.requireExactLength) {
    return `${field.requireExactLength}자리를 입력해주세요`;
  }

  return "";
};

// 확인 버튼 활성화 조건 체크
const isButtonDisabled = computed(() => {
  // 자격증이 선택되지 않았으면 비활성화
  if (!selectedCertificate.value) return true;

  return inputFields.value.some((field) => {
    // 값이 비어있으면 비활성화
    if (!field.value.trim()) return true;

    // 유효하지 않은 값이면 비활성화
    if (isInvalid(field.value, field)) return true;

    return false;
  });
});

// 전체 필드 검증 함수
const validateAllFields = () => {
  // 자격증 선택 확인
  if (!selectedCertificate.value) {
    alert("자격증을 선택해주세요.");
    return false;
  }

  // 모든 입력 필드 확인
  for (const field of inputFields.value) {
    if (!field.value.trim()) {
      alert(`${field.label}을(를) 입력해주세요.`);
      return false;
    }

    if (isInvalid(field.value, field)) {
      alert(`${field.label}을(를) 올바르게 입력해주세요.`);
      return false;
    }
  }

  return true;
};

const createCertificateDto = () => {
  const usernameField = inputFields.value.find(
    (field) => field.id === "username",
  );
  const successDocNoField = inputFields.value.find(
    (field) => field.id === "successDocNo",
  );
  const birthField = inputFields.value.find((field) => field.id === "birth");
  const successCtfyNoLicField = inputFields.value.find(
    (field) => field.id === "successCtfyNoLic",
  );

  return {
    certType: selectedCertificate.value, // 자격증 종류
    successDocNo: successDocNoField.value, // 합격증 중앙에 위치한 번호
    birth: birthField.value, // 생년월일
    successCtfyNoLic: successCtfyNoLicField.value, // 발급번호 마지막 6자리
    username: usernameField.value,
  };
};

const handleSubmit = async () => {
  // 전체 필드 검증
  if (!validateAllFields()) {
    return;
  }

  try {
    // DTO 생성
    const certificateDto = createCertificateDto();
    // API 호출
    const response = await trainerMyPageApi.getCertifications(certificateDto);

    // 성공 시 성공 모달 표시
    modalProps.value = {
      title: "등록이 완료되었습니다.",
      subtitle: "인증뱃지를 획득했습니다.",
      retryButtonText: "확인",
    };
    currentComponent.value = "ConnectSuccessModal";
  } catch (error) {
    console.error("자격증 인증 실패:", error);

    // 실패 시 실패 모달 표시
    modalProps.value = {
      title: "유효하지 않은 자격입니다.",
      subtitle: "입력하신 정보를 다시 확인해주세요",
      retryButtonText: "다시 시도",
    };
    currentComponent.value = "ConnectFailureModal";
  }
};

const goMyPage = () => {
  router.push("/trainer/mypage");
};

// 모달 닫기 함수
const closeModal = () => {
  currentComponent.value = null;
  modalProps.value = {
    title: "",
    subtitle: "",
    retryButtonText: "다시 시도",
  };
};
</script>

<template>
  <div>
    <!-- 기본 폼 (모달이 없을 때만 표시) -->
    <div v-if="!currentComponent">
      <!-- 자격증 드롭다운 -->
      <div>
        <BaseDropbox
          v-model="selectedCertificate"
          label="자격증 종류"
          placeholder="자격증 종류를 선택해주세요"
          :options="[
            '투자자산운용사',
            '금융투자분석사',
            '재무위험관리사',
            '투자권유자문인력',
            '투자권유대행인',
          ]"
        />
      </div>

      <!-- v-for로 Input 반복 -->
      <div v-for="field in inputFields" :key="field.id">
        <div class="mb-1 block px-5 text-sm text-white">
          {{ field.label }}
          <span v-if="field.subLabel" class="ml-1 text-xs text-gray-400">
            {{ field.subLabel }}
          </span>
        </div>
        <BaseInput
          v-model="field.value"
          :placeholder="field.placeholder"
          type="text"
          :isInvalid="isInvalid(field.value, field)"
          :errorMessage="getErrorMessage(field.value, field)"
        />
      </div>

      <div class="px-4 pt-5">
        <BaseButton :isDisabled="isButtonDisabled" @click="handleSubmit">
          확인
        </BaseButton>
      </div>
    </div>

    <!-- 모달 컴포넌트들 -->
    <ConnectSuccessModal
      v-if="currentComponent === 'ConnectSuccessModal'"
      :title="modalProps.title"
      :subtitle="modalProps.subtitle"
      @close="goMyPage"
    />
    <ConnectFailureModal
      v-if="currentComponent === 'ConnectFailureModal'"
      :title="modalProps.title"
      :subtitle="modalProps.subtitle"
      :retryButtonText="modalProps.retryButtonText"
      @retry="closeModal"
    />
  </div>
</template>
