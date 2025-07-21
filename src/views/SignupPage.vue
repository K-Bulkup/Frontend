<script setup>
import { ref } from "vue";

import { useSignup } from "@/composables/user/useSignup";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import FormSectionTitle from "@/components/common/FormSectionTitle.vue";

const step = ref(1);
const { signupAndHandle } = useSignup();

const form = ref({
  email: "",
  password: "",
  passwordConfirm: "",
  nickname: "",
  birthdate: "",
});

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isPasswordValid = (password) => /^(?=.*[^\w\s]).{8,}$/.test(password);

const isPasswordConfirmed = () =>
  form.value.password === form.value.passwordConfirm;

const goNext = () => {
  if (step.value === 1) {
    const valid =
      isEmailValid(form.value.email) &&
      isPasswordValid(form.value.password) &&
      isPasswordConfirmed();
    if (!valid) return;
    step.value++;
  } else if (step.value === 2) {
    if (!form.value.nickname || form.value.nickname.length > 12) return;
    step.value++;
  }
};

const submit = () => {
  signupAndHandle({
    email: form.value.email,
    password: form.value.password,
    nickname: form.value.nickname,
    birthdate: form.value.birthdate,
  });
};
</script>

<template>
  <div class="flex min-h-screen flex-col justify-between px-1 py-20">
    <div>
      <FormSectionTitle
        :title="
          step === 1
            ? '회원가입을 진행해주세요.'
            : step === 2
              ? '이름을 입력해주세요.'
              : '생년월일을 입력해주세요.'
        "
        :subtitle="
          step === 1
            ? '이메일과 비밀번호를 입력해주세요'
            : step === 2
              ? '이름은 공백 없이 12자 이하만 가능합니다.'
              : '응답하신 생년월일은 공개되지 않습니다.'
        "
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
              <span class="text-xl text-gray-500">👤</span>
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
              <span class="text-xl text-gray-500">🔒</span>
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
              <span class="text-xl text-gray-500">🔒</span>
            </template>
          </BaseInput>
        </template>

        <template v-else-if="step === 2">
          <BaseInput
            v-model="form.nickname"
            placeholder="이름을 입력해주세요"
            :is-invalid="form.nickname !== '' && form.nickname.length > 12"
            error-message="이름은 공백 없이 12자 이하만 가능합니다"
          />
        </template>

        <template v-else-if="step === 3">
          <BaseInput
            v-model="form.birthdate"
            placeholder="생년월일을 입력해주세요"
          />
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
        :isDisabled="!form.nickname || form.nickname.length > 12"
      >
        다음
      </BaseButton>

      <BaseButton v-else @click="submit">가입완료</BaseButton>
    </div>
  </div>
</template>
