<script setup>
import { computed } from "vue";
import { UserIcon } from "lucide-vue-next";

const props = defineProps({
  chatData: {
    type: Object,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  remainingDays: {
    type: String,
    required: true,
  },
  courseTitle: {
    type: String,
    required: true,
  },
  lastMessage: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
  isExpired: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);

const remainingDaysClass = computed(() => {
  if (props.isExpired || props.remainingDays === "만료") {
    return "bg-gray-400"; // 만료
  }

  const hourMatch = props.remainingDays.match(/(\d+)시간/);
  const minuteMatch = props.remainingDays.match(/(\d+)분/);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes <= 60) {
    return "bg-red-500"; // 🔴 1시간 이하
  }

  return "bg-green-500"; // ✅ 1시간 초과
});
</script>

<template>
  <div
    class="flex cursor-pointer items-center border-b border-gray-800 p-4 transition-colors hover:bg-gray-900"
    @click="$emit('click', chatData)"
  >
    <div class="relative mr-3">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600"
      >
        <UserIcon class="h-6 w-6 text-gray-300" />
      </div>
      <div
        v-if="unreadCount > 0"
        class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500"
      >
        <span class="text-xs font-bold text-white">{{
          unreadCount > 9 ? "9+" : unreadCount
        }}</span>
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <div class="mb-1 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="font-medium text-white">{{ userName }}</span>
          <span
            class="rounded-full px-2 py-1 text-xs"
            :class="remainingDaysClass"
          >
            {{ remainingDays }}
          </span>
        </div>
        <span class="text-xs text-gray-400">{{ timestamp }}</span>
      </div>

      <div class="mb-1 text-sm font-medium text-gray-300">
        {{ courseTitle }}
      </div>

      <div class="flex items-center">
        <p class="flex-1 truncate text-xs text-gray-400">{{ lastMessage }}</p>
      </div>
    </div>
  </div>
</template>
