<template>
  <div
    class="admin-user-create-page bg-realblack mx-auto max-w-3xl p-6 text-white"
  >
    <h1 class="mb-6 text-2xl font-bold">새 사용자 생성</h1>

    <div
      class="bg-realblack mb-6 rounded-lg border border-gray-300 p-6 shadow-sm"
    >
      <form @submit.prevent="handleCreateUser" class="space-y-5">
        <BaseFormField label="사용자 이름">
          <BaseInput type="text" v-model="newUser.username" required />
        </BaseFormField>

        <BaseFormField label="이메일">
          <BaseInput type="email" v-model="newUser.email" required />
        </BaseFormField>

        <BaseFormField label="비밀번호">
          <BaseInput type="password" v-model="newUser.password" required />
          <p class="mt-1 text-xs text-gray-500">
            최소 8자, 최대 64자이며, 소문자, 숫자, 특수문자(@$!%*?&)를 각각 1개
            이상 포함해야 합니다.
          </p>
        </BaseFormField>

        <BaseFormField label="전화번호">
          <BaseInput type="text" v-model="newUser.phone" />
        </BaseFormField>

        <BaseFormField label="주소">
          <BaseInput type="text" v-model="newUser.address" />
        </BaseFormField>

        <BaseFormField label="역할">
          <select
            v-model="newUser.role"
            class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          >
            <option value="">역할 선택</option>
            <option value="TRAINEE">TRAINEE</option>
            <option value="TRAINER">TRAINER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </BaseFormField>

        <BaseFormField label="생년월일">
          <BaseInput
            type="text"
            v-model="newUser.birthdate"
            placeholder="YYYYMMDDHHmmss"
          />
          <p class="mt-1 text-xs text-gray-500">
            예: 19900101120000 (YYYYMMDDHHmmss)
          </p>
        </BaseFormField>

        <div class="mt-6 flex space-x-4">
          <BaseButton
            type="submit"
            class="bg-realblack rounded-md px-6 py-2 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            사용자 생성
          </BaseButton>
          <BaseButton
            type="button"
            @click="$router.back()"
            class="rounded-md bg-gray-300 px-6 py-2 text-sm font-bold text-gray-800 transition hover:bg-gray-400"
          >
            취소
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAdminUserApi } from "@/composables/api/useAdminUserApi";
import BaseButton from "@/components/admin/AdminBaseButton.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";

const router = useRouter();
const { createUser } = useAdminUserApi();

const newUser = ref({
  username: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  role: "",
  birthdate: "",
});

const handleCreateUser = async () => {
  try {
    const payload = {
      ...newUser.value,
      loginType: "LOCAL", // 회원가입은 LOCAL로 고정
    };
    await createUser(payload);
    alert("사용자가 성공적으로 생성되었습니다.");
    router.push("/admin/user-management/list"); // 생성 후 목록 페이지로 이동
  } catch (err) {
    alert("사용자 생성에 실패했습니다.");
    console.error(err);
  }
};
</script>

<style scoped>
/* Tailwind CSS is used, so minimal custom styles are needed. */
</style>
