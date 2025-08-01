<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSignup } from "@/composables/user/useSignup";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";

const router = useRouter();
const step = ref(1);
const { signupAndHandle } = useSignup();

const form = ref({
  email: "",
  password: "",
  passwordConfirm: "",
  username: "",
  birthdate: "",
  role: "",
  loginType: "LOCAL",
});

const selectedRole = ref(null); // 선택된 역할을 저장

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isPasswordValid = (password) => /^(?=.*[^\w\s]).{8,}$/.test(password);

const isPasswordConfirmed = () =>
  form.value.password === form.value.passwordConfirm;

const isUsernameValid = (username) => /^[^\s]{1,12}$/.test(username);

const isBirthdateValid = (birthdate) => /^\d{8}$/.test(birthdate);

const goNext = () => {
  if (step.value === 1) {
    const valid =
      isEmailValid(form.value.email) &&
      isPasswordValid(form.value.password) &&
      isPasswordConfirmed();
    if (!valid) return;
    step.value++;
  } else if (step.value === 2) {
    if (!isUsernameValid(form.value.username)) return;
    step.value++;
  } else if (step.value === 3) {
    if (!isBirthdateValid(form.value.birthdate)) return;
    step.value++; // 4단계로 이동
  }
};

// 역할 카드 클릭 시 호출될 함수
const handleRoleSelection = (role) => {
  form.value.role = role;
  selectedRole.value = role; // 선택된 역할 업데이트
};

const result = ref(null);

const submit = async () => {
  // 8자리 숫자 형식의 생년월일 (예: 19900101)
  const rawBirthdate = form.value.birthdate;

  // YYYY-MM-DD 형식으로 변환
  const year = rawBirthdate.substring(0, 4);
  const month = rawBirthdate.substring(4, 6);
  const day = rawBirthdate.substring(6, 8);
  const formattedBirthdate = `${rawBirthdate}000000`; // 8자리 날짜 뒤에 000000 붙이기

  console.log("Sending signup request with form data:", {
    email: form.value.email,
    password: form.value.password,
    username: form.value.username,
    birthdate: formattedBirthdate,
    role: form.value.role,
    loginType: form.value.loginType,
  });

  const { success } = await signupAndHandle({
    email: form.value.email,
    password: form.value.password,
    username: form.value.username,
    birthdate: formattedBirthdate,
    role: form.value.role,
    loginType: form.value.loginType,
  });

  result.value = success ? "success" : "fail";
};
</script>

<template>
  <div
    v-if="result === 'success'"
    class="flex min-h-screen flex-col justify-between px-1 py-20"
  >
    <BaseStatusMessage
      icon="✅"
      title="회원가입이 완료되었습니다"
      subtitle="K-Bulkup과 함께 건강한 습관을 시작해보세요"
      variant="status"
    />
    <div class="mt-10 flex w-full justify-center">
      <BaseButton @click="router.push('/login')">홈으로 가기</BaseButton>
    </div>
  </div>

  <div
    v-else-if="result === 'fail'"
    class="flex min-h-screen flex-col justify-between px-1 py-20"
  >
    <BaseStatusMessage
      icon="⚠️"
      title="회원가입에 실패했습니다"
      subtitle="입력한 정보를 다시 한 번 확인해주세요"
      variant="status"
    />
    <div class="mt-10 flex w-full justify-center">
      <BaseButton @click="result = null">다시 시도</BaseButton>
    </div>
  </div>

  <div v-else class="flex min-h-screen flex-col justify-between px-1 py-20">
    <div>
      <BaseStatusMessage
        :title="
          step === 1
            ? '회원가입을 진행해주세요.'
            : step === 2
              ? '이름을 입력해주세요.'
              : step === 3
                ? '생년월일을 입력해주세요.'
                : '어떤 유형으로 가입하시겠어요?'
        "
        :subtitle="
          step === 1
            ? '이메일과 비밀번호를 입력해주세요'
            : step === 2
              ? '이름은 공백 없이 12자 이하만 가능합니다.'
              : step === 3
                ? '응답하신 생년월일은 공개되지 않습니다.'
                : '트레이너 또는 회원 중 선택해주세요.'
        "
        variant="guide"
      />

      <div class="mt-6 flex flex-col items-center space-y-4">
        <template v-if="step === 1">
          <BaseInput
            v-model="form.email"
            placeholder="이메일을 입력해주세요"
            :is-invalid="form.email !== '' && !isEmailValid(form.email)"
            error-message="올바른 이메일 형식을 입력해주세요"
          >
            <template #icon>
              <span class="text-xl text-gray-500">
                <font-awesome-icon :icon="['far', 'user']" />
              </span>
            </template>
          </BaseInput>

          <BaseInput
            v-model="form.password"
            type="password"
            placeholder="비밀번호를 입력해주세요"
            :is-invalid="
              form.password !== '' && !isPasswordValid(form.password)
            "
            error-message="비밀번호는 8자 이상, 특수문자를 포함해야 합니다"
          >
            <template #icon>
              <span class="text-xl text-gray-500">
                <font-awesome-icon :icon="['fas', 'lock']" />
              </span>
            </template>
          </BaseInput>

          <BaseInput
            v-model="form.passwordConfirm"
            type="password"
            placeholder="비밀번호를 다시 입력해주세요"
            :is-invalid="form.passwordConfirm !== '' && !isPasswordConfirmed()"
            error-message="비밀번호가 일치하지 않습니다"
          >
            <template #icon>
              <span class="text-xl text-gray-500">
                <font-awesome-icon :icon="['fas', 'lock']" />
              </span>
            </template>
          </BaseInput>
        </template>

        <template v-else-if="step === 2">
          <BaseInput
            v-model="form.username"
            placeholder="이름을 입력해주세요"
            :is-invalid="
              form.username !== '' && !isUsernameValid(form.username)
            "
            error-message="이름은 공백 없이 12자 이하만 가능합니다"
          />
        </template>

        <template v-else-if="step === 3">
          <BaseInput
            v-model="form.birthdate"
            placeholder="생년월일을 입력해주세요"
            :is-invalid="
              form.birthdate !== '' && !isBirthdateValid(form.birthdate)
            "
            error-message="8자리 숫자(19990101 형식)로 입력해주세요"
          />
        </template>

        <template v-else-if="step === 4">
          <div class="mt-8 space-y-4">
            <!-- 역할 카드 -->
            <div
              v-for="role in ['TRAINER', 'TRAINEE']"
              :key="role"
              @click="handleRoleSelection(role)"
              :class="{ 'border-4 border-yellow-500': selectedRole === role }"
              class="flex cursor-pointer items-center justify-between rounded-xl bg-white px-4 py-4 shadow"
            >
              <div>
                <p class="font-bold text-black">
                  {{ role === "TRAINER" ? "트레이너" : "회원" }}
                </p>
                <p class="text-sm text-gray-500">
                  {{
                    role === "TRAINER"
                      ? "회원을 찾고 있어요."
                      : "트레이너를 찾고 있어요."
                  }}
                </p>
              </div>
              <img
                :src="
                  role === 'TRAINER'
                    ? '/src/assets/images/trainer-icon.png'
                    : '/src/assets/images/trainee-icon.png'
                "
                :alt="role === 'TRAINER' ? '트레이너 아이콘' : '회원 아이콘'"
                class="h-12 w-12"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="mt-10 flex flex-col items-center">
      <BaseButton
        v-if="step === 1"
        @click="goNext"
        :isDisabled="
          !isEmailValid(form.email) ||
          !isPasswordValid(form.password) ||
          !isPasswordConfirmed()
        "
      >
        다음
      </BaseButton>

      <BaseButton
        v-else-if="step === 2"
        @click="goNext"
        :isDisabled="!form.username || form.username.length > 12"
      >
        다음
      </BaseButton>

      <BaseButton
        v-else-if="step === 3"
        @click="goNext"
        :isDisabled="!isBirthdateValid(form.birthdate)"
      >
        다음
      </BaseButton>

      <BaseButton v-if="step === 4" @click="submit" :isDisabled="!form.role">
        가입완료
      </BaseButton>
    </div>
  </div>
</template>
