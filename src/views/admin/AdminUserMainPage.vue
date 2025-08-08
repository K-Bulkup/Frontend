<template>
  <div class="admin-user-main-page p-4">
    <h1 class="mb-4 text-2xl font-bold">사용자 관리 메인</h1>

    <div class="grid grid-cols-2 gap-6">
      <!-- 사용자 목록 보기 -->
      <div
        class="flex h-[200px] min-w-0 flex-col justify-between rounded-xl bg-white p-5 shadow"
      >
        <div>
          <h2 class="mb-2 text-2xl font-semibold text-black">목록 보기</h2>
          <p class="mb-4 text-gray-400">등록된 모든 사용자를 확인</p>
        </div>
        <BaseButton
          @click="$router.push('/admin/user-management/list')"
          class="rounded-md bg-black py-2 text-sm font-bold text-white hover:bg-gray-800"
        >
          이동하기
        </BaseButton>
      </div>

      <!-- 새 사용자 추가 -->
      <div
        class="flex h-[200px] min-w-0 flex-col justify-between rounded-xl bg-white p-5 shadow"
      >
        <div>
          <h2 class="mb-2 text-2xl font-semibold text-black">추가하기</h2>
          <p class="mb-4 text-gray-400">새로운 사용자를 추가</p>
        </div>
        <BaseButton
          @click="$router.push('/admin/user-management/create')"
          class="rounded-md bg-black py-2 text-sm font-bold text-white hover:bg-gray-800"
        >
          이동하기
        </BaseButton>
      </div>

      <!-- 사용자 정보 수정 -->
      <div
        class="flex h-[200px] min-w-0 flex-col justify-between rounded-xl bg-white p-5 shadow"
      >
        <div>
          <h2 class="mb-2 text-2xl font-semibold text-black">수정하기</h2>
          <p class="mb-4 text-gray-400">기존 사용자의 정보를 수정</p>
        </div>
        <BaseButton
          @click="$router.push('/admin/user-management/list')"
          class="rounded-md bg-black py-2 text-sm font-bold text-white hover:bg-gray-800"
        >
          이동하기
        </BaseButton>
      </div>

      <!-- 사용자 삭제 -->
      <div
        class="flex h-[200px] min-w-0 flex-col justify-between rounded-xl bg-white p-5 shadow"
      >
        <div>
          <h2 class="mb-2 text-2xl font-semibold text-black">삭제하기</h2>
          <p class="mb-4 text-gray-400">사용자를 서비스에서 제거</p>
        </div>
        <BaseButton
          @click="$router.push('/admin/user-management/list')"
          class="rounded-md bg-black py-2 text-sm font-bold text-white hover:bg-gray-800"
        >
          이동하기
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from "@/components/common/BaseButton.vue";
</script>

<style scoped>
/* Tailwind CSS is used, so minimal custom styles are needed. */
</style>
