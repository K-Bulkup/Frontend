<template>
  <div class="admin-user-list-page p-4">
    <h1 class="text-2xl font-bold mb-4">사용자 목록</h1>

    <!-- User List -->
    <div class="bg-white p-4 rounded-lg shadow-sm">
      <div v-if="loading" class="text-center text-gray-500">사용자 정보를 불러오는 중...</div>
      <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
      <ul v-else class="divide-y divide-gray-200">
        <li v-for="user in users" :key="user.userId" class="py-4 flex justify-between items-center">
          <div class="text-black">
            <p class="text-lg font-medium text-black">{{ user.username }} (ID: {{ user.userId }})</p>
            <p class="text-sm text-black">{{ user.email }}</p>
            <p class="text-sm text-black">역할: {{ user.roles ? user.roles.join(', ') : 'N/A' }}</p>
            <p v-if="user.createdAt" class="text-xs text-black">생성일: {{ new Date(user.createdAt).toLocaleString() }}</p>
            <p v-if="user.updatedAt" class="text-xs text-black">수정일: {{ new Date(user.updatedAt).toLocaleString() }}</p>
          </div>
          <div class="flex space-x-2">
            <BaseButton @click="$router.push(`/admin/member-management/edit/${user.userId}`)" class="rounded-md bg-black py-1 text-sm font-bold text-white hover:bg-gray-800">수정</BaseButton>
            <BaseButton @click="deleteUser(user.userId)" class="rounded-md bg-black py-1 text-sm font-bold text-white hover:bg-gray-800">삭제</BaseButton>
          </div>
        </li>
      </ul>
      <div v-if="users.length === 0 && !loading && !error" class="text-center text-gray-500 mt-4">
        등록된 사용자가 없습니다.
      </div>
    </div>
    <div class="mt-4">
      <BaseButton @click="$router.back()" class="rounded-md bg-black py-2 text-sm font-bold text-white hover:bg-gray-800">뒤로 가기</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdminUserApi } from '@/composables/api/useAdminUserApi';
import BaseButton from "@/components/common/BaseButton.vue";

const { getAllUsers, deleteUser: deleteUserApi } = useAdminUserApi();

const users = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchUsers = async () => {
  try {
    loading.value = true;
    error.value = null;
    users.value = await getAllUsers();
    console.log('Fetched users:', users.value);
  } catch (err) {
    error.value = '사용자 목록을 불러오는데 실패했습니다.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (userId) => {
  if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
    try {
      await deleteUserApi(userId);
      alert('사용자가 성공적으로 삭제되었습니다.');
      fetchUsers(); // Refresh list
    } catch (err) {
      alert('사용자 삭제에 실패했습니다.');
      console.error(err);
    }
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
/* Tailwind CSS is used, so minimal custom styles are needed. */
</style>
