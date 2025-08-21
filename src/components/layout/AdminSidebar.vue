<template>
  <div class="min-h-screen w-64 bg-gray-800 p-4 text-white">
    <h2 class="mb-6 text-2xl font-bold">관리자 메뉴</h2>
    <ul>
      <li class="mb-2">
        <router-link
          to="/admin/user-management"
          class="block rounded px-3 py-2 hover:bg-gray-700"
          >회원 관리</router-link
        >
      </li>
      <li class="mb-2">
        <router-link
          to="/admin/training-approval"
          class="block rounded px-3 py-2 hover:bg-gray-700"
          >강좌 승인</router-link
        >
      </li>
      <li class="mb-2">
        <router-link
          to="/admin/user-statistics"
          class="block rounded px-3 py-2 hover:bg-gray-700"
          >회원 통계</router-link
        >
      </li>
      <li class="mb-2">
        <router-link
          to="/admin/payment-statistics"
          class="block rounded px-3 py-2 hover:bg-gray-700"
          >매출 통계</router-link
        >
      </li>
      <!-- Add more admin links as needed -->
    </ul>
  </div>
</template>

<script setup></script>

<style scoped></style>
