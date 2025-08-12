<template>
  <div class="bg-realblack min-h-screen p-6 text-white">
    <h1 class="mb-6 text-3xl font-bold">사용자 관리</h1>
    <!-- Add User Button -->

    <Button
      @click="$router.push('/admin/user-management/create')"
      class="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-4xl font-extrabold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label="사용자 추가"
    >
      +
    </Button>

    <div class="mx-auto max-w-6xl rounded-xl bg-gray-800 p-4 shadow">
      <div class="overflow-x-auto rounded-lg">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-900 text-white">
            <tr>
              <th class="px-4 py-3 text-left font-semibold">사용자명</th>
              <th class="px-4 py-3 text-left font-semibold">이메일</th>
              <th class="px-4 py-3 text-left font-semibold">역할</th>
              <th class="px-4 py-3 text-center font-semibold">생성일</th>
              <th class="px-4 py-3 text-center font-semibold">관리</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="users.length === 0 && !loading && !error">
              <td colspan="5" class="px-4 py-6 text-center text-gray-400">
                등록된 사용자가 없습니다.
              </td>
            </tr>
            <tr
              v-for="user in users"
              :key="user.userId"
              class="transition hover:bg-gray-600"
            >
              <td class="whitespace-nowrap px-4 py-3 font-medium">
                {{ user.username }}
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-gray-300">
                {{ user.email }}
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-gray-300">
                {{ user.roles ? user.roles.join(", ") : "N/A" }}
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-center text-gray-300">
                {{
                  user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"
                }}
              </td>
              <td class="space-x-2 px-4 py-3 text-center">
                <button
                  @click="
                    $router.push(`/admin/user-management/edit/${user.userId}`)
                  "
                  class="bg-realblack rounded-md px-3 py-1 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  수정
                </button>
                <button
                  @click="deleteUser(user.userId)"
                  class="bg-realblack rounded-md px-3 py-1 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  삭제
                </button>
              </td>
            </tr>
            <tr v-if="loading">
              <td
                colspan="5"
                class="px-4 py-6 text-center font-semibold text-gray-400"
              >
                사용자 정보를 불러오는 중...
              </td>
            </tr>
            <tr v-if="error">
              <td
                colspan="5"
                class="px-4 py-6 text-center font-semibold text-red-500"
              >
                {{ error }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAdminUserApi } from "@/composables/api/useAdminUserApi";
import BaseButton from "@/components/admin/AdminBaseButton.vue";

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
