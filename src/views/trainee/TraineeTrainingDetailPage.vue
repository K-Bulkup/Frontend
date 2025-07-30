<script setup>
import { useRouter } from "vue-router";
import { MessageCircleIcon } from "lucide-vue-next";
import apiClient from "@/plugins/axios";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();

const authStore = useAuthStore();

const handleClick = async () => {
  const traineeId = 4; // ✅ 실제 로그인 유저 ID
  const trainingId = 2; // /training/:id 라면 params.id 사용

  try {
    const response = await apiClient.post("/api/common/counselings", {
      traineeId,
      trainingId,
    });

    const roomId = response.data.data.roomId;
    router.push(`/trainee/mypage/pt-chat/${roomId}`);
  } catch (error) {
    console.error("채팅방 생성 또는 조회 실패:", error);
  }
};
</script>

<template>
  <div class="p-4">
    <button
      @click="handleClick"
      class="relative flex items-center gap-2 rounded-2xl bg-yellow-300 px-4 py-2 font-semibold text-gray-800"
    >
      <MessageCircleIcon class="h-5 w-5" />
      <span>트레이너와 1:1 채팅하기</span>
      <span
        class="absolute -right-2 -top-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white"
      >
        강
      </span>
    </button>
  </div>
</template>
