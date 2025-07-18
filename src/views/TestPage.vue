<template>
  <section class="p-6">
    <h2 class="text-2xl font-bold mb-4">🧪 Test Page</h2>

    <div v-if="isLoading" class="text-gray700">불러오는 중...</div>
    <div v-else-if="user">
      <p class="text-lg">🙋 유저 이름: {{ user.name }}</p>
      <p class="text-gray700 text-sm mt-1">이메일: {{ user.email }}</p>
    </div>
    <div v-else class="text-red-500">유저 정보를 불러오지 못했습니다.</div>
    <BaseButton>테스트 버튼</BaseButton>
  </section>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue';
import { useUser } from '@/composables/user/useUser';

const userId = 1;
const { user, isLoading } = useUser(userId);
</script>
