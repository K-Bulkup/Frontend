<script setup>
import { ref } from "vue";

import BaseButton from "@/components/common/BaseButton.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import FormSectionTitle from "@/components/common/FormSectionTitle.vue";

const name = ref("");
const password = ref("");
</script>

<template>
  <FormSectionTitle
    title="생년월일을 입력해주세요."
    subtitle="응답하신 생년월일은 공개되지 않습니다."
  />
  <div class="flex flex-col items-center space-y-4">
    <BaseInput placeholder="이름을 입력해주세요" v-model="name">
      <template #icon>
        <span class="text-xl text-gray-500">👤</span>
      </template>
    </BaseInput>
    <BaseInput
      placeholder="비밀번호를 입력해주세요"
      type="password"
      v-model="password"
      :isInvalid="password.length < 6"
    >
      <template #icon>
        <span class="text-xl text-gray-500">🔒</span>
      </template>
    </BaseInput>
  </div>

  <div class="mt-4 flex justify-center">
    <BaseButton>가입 완료</BaseButton>
  </div>
</template>
