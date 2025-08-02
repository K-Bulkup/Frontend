<template>
  <div class="mt-8 w-full space-y-4">
    <div
      v-for="role in ['TRAINER', 'TRAINEE']"
      :key="role"
      @click="$emit('select', role)"
      :class="[
        'flex w-full max-w-[400px] cursor-pointer items-center justify-between rounded-xl px-6 py-4 shadow md:px-10',
        selected === role ? 'bg-yellow-100' : 'bg-white',
      ]"
    >
      <div>
        <p class="font-bold text-black">
          {{ role === "TRAINER" ? "트레이너" : "회원" }}
        </p>
        <p class="text-sm text-gray-500">
          {{
            role === "TRAINER"
              ? "회원을 찾고 있어요."
              : "트레이너를 찾고 있어요."
          }}
        </p>
      </div>
      <img
        :src="role === 'TRAINER' ? trainerIcon : traineeIcon"
        :alt="role === 'TRAINER' ? '트레이너 아이콘' : '회원 아이콘'"
        class="h-12 w-12"
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
