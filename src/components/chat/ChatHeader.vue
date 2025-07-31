<script setup>
import { computed } from "vue";
import { ChevronLeftIcon, UserIcon } from "lucide-vue-next";

const props = defineProps({
  userName: {
    type: String,
    required: true,
  },
  userProfileUrl: {
    type: String,
    default: null,
  },
  expiresAt: {
    type: [Date, null],
    default: null,
  },
});

defineEmits(["back"]);

const remainingPeriodText = computed(() => {
  if (!props.expiresAt || isNaN(props.expiresAt.getTime?.())) {
    return "만료 시간 알 수 없음";
  }

  const diff = props.expiresAt.getTime() - Date.now();
  if (diff <= 0) return "만료";

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}시간 ${minutes}분 남음`;
});

const badgeClass = computed(() => {
  if (!props.expiresAt || isNaN(props.expiresAt.getTime?.())) {
    return "bg-gray-400";
  }

  const diff = props.expiresAt.getTime() - Date.now();
  if (diff <= 0) return "bg-gray-400";
  if (diff <= 60 * 60 * 1000) return "bg-red-500";
  return "bg-green-500";
});
</script>

<template>
  <div class="flex items-center justify-between border-b border-gray-800 py-4">
    <div class="flex items-center space-x-3">
      <button @click="$emit('back')" class="p-1">
        <ChevronLeftIcon class="h-6 w-6" />
      </button>
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white"
      >
        <UserIcon v-if="!userProfileUrl" class="h-6 w-6 text-gray-600" />
        <img
          v-else
          :src="userProfileUrl"
          class="h-10 w-10 rounded-full object-cover"
        />
      </div>
      <div class="flex items-center space-x-2">
        <span class="font-medium">{{ userName }}</span>
        <span
          class="rounded-full px-2 py-1 text-xs text-white"
          :class="badgeClass"
        >
          {{ remainingPeriodText }}
        </span>
      </div>
    </div>
  </div>
</template>
