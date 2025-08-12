<template>
  <div class="w-64 bg-gray-800 text-white p-4 min-h-screen">
    <h2 class="text-2xl font-bold mb-6">관리자 메뉴</h2>
    <ul>
      <li class="mb-2">
        <router-link to="/admin/user-management" class="block py-2 px-3 rounded hover:bg-gray-700">회원 관리</router-link>
      </li>
      <li class="mb-2">
        <router-link to="/admin/training-approval" class="block py-2 px-3 rounded hover:bg-gray-700">강좌 승인</router-link>
      </li>
      <li class="mb-2">
        <router-link to="/admin/user-statistics" class="block py-2 px-3 rounded hover:bg-gray-700">회원 통계</router-link>
      </li>
      <li class="mb-2">
        <router-link to="/admin/payment-statistics" class="block py-2 px-3 rounded hover:bg-gray-700">매출 통계</router-link>
      </li>
      <!-- Add more admin links as needed -->
    </ul>
  </div>
</template>

<script setup>
// No script needed for now
</script>

<style scoped>
/* Add specific styles if necessary */
</style>
