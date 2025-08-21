<template>
  <div class="mt-8 w-full space-y-4">
    <div
      v-for="role in ['TRAINER', 'TRAINEE']"
      :key="role"
      @click="$emit('select', role)"
      :class="[
        'flex w-full max-w-[400px] cursor-pointer items-center justify-between rounded-xl px-6 py-4 shadow md:px-10',
        'border-2 bg-gray-900 transition-colors duration-200', // 공통: 배경 + 테두리 두께
        selected === role
          ? 'hover:border-primary hover:bg-primary hover:bg-opacity-10'
          : 'border-gray-900',
      ]"
      style="width: 341px; height: 97px"
    >
      <div>
        <p class="text-body6">
          {{ role === "TRAINER" ? "트레이너" : "트레이니" }}
        </p>
        <p class="text-subtext mt-1 text-input text-gray-300">
          {{
            role === "TRAINER"
              ? "트레이니을 찾고 있어요."
              : "트레이너를 찾고 있어요."
          }}
        </p>
      </div>
      <img
        :src="role === 'TRAINER' ? trainerIcon : traineeIcon"
        :alt="role === 'TRAINER' ? '트레이너 아이콘' : '회원 아이콘'"
        class="w-[60px] shrink-0"
      />
    </div>
  </div>
</template>

<script setup>
import trainerIcon from "@/assets/images/trainer-icon.png";
import traineeIcon from "@/assets/images/trainee-icon.png";

defineProps({
  selected: String,
});
defineEmits(["select"]);
</script>
