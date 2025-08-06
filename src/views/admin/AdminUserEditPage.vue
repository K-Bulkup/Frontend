<template>
  <div class="admin-user-edit-page p-4">
    <h1 class="mb-4 text-2xl font-bold">사용자 정보 수정</h1>

    <div v-if="loading" class="text-center text-gray-500">
      사용자 정보를 불러오는 중...
    </div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-else class="mb-6 rounded-lg border bg-white p-4 shadow-sm">
      <form @submit.prevent="handleUpdateUser">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BaseFormField label="사용자 ID">
            <BaseInput type="text" v-model="editingUser.userId" disabled />
          </BaseFormField>

          <BaseFormField label="사용자 이름" class="text-black">
            <BaseInput type="text" v-model="editingUser.username" />
          </BaseFormField>

          <BaseFormField label="이메일" class="text-black">
            <BaseInput type="email" v-model="editingUser.email" />
          </BaseFormField>

          <BaseFormField label="전화번호">
            <BaseInput type="text" v-model="editingUser.phone" />
          </BaseFormField>

          <BaseFormField label="주소">
            <BaseInput type="text" v-model="editingUser.address" />
          </BaseFormField>

          <BaseFormField label="역할">
            <select
              v-model="editingUser.role"
              class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
            >
              <option value="TRAINEE">TRAINEE</option>
              <option value="TRAINER">TRAINER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </BaseFormField>

          <BaseFormField label="생년월일">
            <BaseInput
              type="text"
              v-model="editingUser.birthdate"
              placeholder="YYYYMMDDHHmmss"
            />
            <p class="mt-1 text-xs text-gray-500">
              예: 199001011 (YYYYMMDDHHmmss)
            </p>
          </BaseFormField>

          <BaseFormField label="로그인 타입">
            <BaseInput type="text" v-model="editingUser.loginType" disabled />
          </BaseFormField>

          <BaseFormField v-if="editingUser.providerId" label="제공자 ID">
            <BaseInput type="text" v-model="editingUser.providerId" disabled />
          </BaseFormField>
        </div>

        <div class="mt-4 flex space-x-2">
          <BaseButton
            type="submit"
            class="rounded-md bg-black py-2 text-sm font-bold text-white hover:bg-gray-800"
          >
            저장
          </BaseButton>
          <BaseButton
            type="button"
            @click="$router.back()"
            class="rounded-md bg-gray-300 py-2 text-sm font-bold text-gray-800 hover:bg-gray-400"
          >
            취소
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAdminUserApi } from "@/composables/api/useAdminUserApi";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";

const route = useRoute();
const router = useRouter();
const { getUserById, updateUser } = useAdminUserApi();

const editingUser = ref({
  userId: null,
  username: "",
  email: "",
  phone: "",
  address: "",
  role: "",
  birthdate: "",
  loginType: "",
  providerId: "",
});
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  const userId = route.params.userId;
  if (userId) {
    try {
      loading.value = true;
      error.value = null;
      const user = await getUserById(userId);
      editingUser.value = { ...user };
    } catch (err) {
      error.value = "사용자 정보를 불러오는데 실패했습니다.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  } else {
    error.value = "사용자 ID가 제공되지 않았습니다.";
    loading.value = false;
  }
});

const handleUpdateUser = async () => {
  try {
    const payload = {
      username: editingUser.value.username,
      email: editingUser.value.email,
      phone: editingUser.value.phone,
      address: editingUser.value.address,
      role: editingUser.value.role,
      birthdate: editingUser.value.birthdate,
    };
    await updateUser(editingUser.value.userId, payload);
    alert("사용자 정보가 성공적으로 업데이트되었습니다.");
    router.push("/admin/member-management/list"); // 업데이트 후 목록 페이지로 이동
  } catch (err) {
    alert("사용자 정보 업데이트에 실패했습니다.");
    console.error(err);
  }
};
</script>

<style scoped>
/* Tailwind CSS is used, so minimal custom styles are needed. */
</style>
