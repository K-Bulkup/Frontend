<template>
  <div class="admin-user-main-page min-h-screen bg-white p-6 text-black">
    <h1 class="mb-6 text-3xl font-bold">사용자 관리</h1>

    <div class="mx-auto max-w-6xl rounded-xl p-4 shadow">
      <!-- Add User Button -->
      <div class="mb-4 flex justify-end">
        <BaseButton
          @click="$router.push('/admin/user-management/create')"
          class="rounded-md bg-gray-200 px-3 py-1 text-sm font-bold text-black transition hover:bg-gray-300"
        >
          + 사용자 추가
        </BaseButton>
      </div>

      <!-- User List -->
      <div class="rounded-lg bg-white p-4 shadow-sm">
        <div v-if="loading" class="text-center text-gray-500">
          사용자 정보를 불러오는 중...
        </div>
        <div v-else-if="error" class="text-center text-red-500">
          {{ error }}
        </div>
        <ul v-else class="divide-y divide-gray-200">
          <li
            v-for="user in users"
            :key="user.userId"
            class="flex items-center justify-between py-4"
          >
            <div>
              <p class="text-lg font-medium">
                {{ user.username }} (ID: {{ user.userId }})
              </p>
              <p class="text-sm">{{ user.email }}</p>
              <p class="text-sm">
                역할: {{ user.roles ? user.roles.join(", ") : "N/A" }}
              </p>
              <p v-if="user.createdAt" class="text-xs">
                생성일: {{ new Date(user.createdAt).toLocaleString() }}
              </p>
              <p v-if="user.updatedAt" class="text-xs">
                수정일: {{ new Date(user.updatedAt).toLocaleString() }}
              </p>
            </div>
            <div class="flex space-x-2">
              <BaseButton
                @click="
                  $router.push(`/admin/user-management/edit/${user.userId}`)
                "
                class="rounded-md bg-black px-3 py-1 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                수정
              </BaseButton>
              <BaseButton
                @click="deleteUser(user.userId)"
                class="rounded-md bg-black px-3 py-1 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                삭제
              </BaseButton>
            </div>
          </li>
        </ul>
        <div
          v-if="users.length === 0 && !loading && !error"
          class="mt-4 text-center text-gray-500"
        >
          등록된 사용자가 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAdminUserApi } from "@/composables/api/useAdminUserApi";
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
  } catch (err) {
    error.value = "사용자 목록을 불러오는데 실패했습니다.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (userId) => {
  if (confirm("정말로 이 사용자를 삭제하시겠습니까?")) {
    try {
      await deleteUserApi(userId);
      alert("사용자가 성공적으로 삭제되었습니다.");
      fetchUsers();
    } catch (err) {
      alert("사용자 삭제에 실패했습니다.");
      console.error(err);
    }
  }
};

onMounted(fetchUsers);
</script>
