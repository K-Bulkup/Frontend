<script setup>
import { ChevronLeftIcon, UserIcon } from "lucide-vue-next";

defineProps({
  userName: {
    type: String,
    default: "김헬스",
  },
  remainingPeriod: {
    type: String,
    default: "2일 남음",
  },
  status: {
    type: String,
    default: "온라인",
  },
});

defineEmits(["back"]);
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
        <UserIcon class="h-6 w-6 text-gray-600" />
      </div>
      <div>
        <div class="flex items-center space-x-2">
          <span class="font-medium">{{ userName }}</span>
          <span
            :class="[
              'rounded-full px-2 py-1 text-xs text-white',
              remainingPeriod === '3일 남음'
                ? 'bg-orange-500'
                : remainingPeriod === '2일 남음'
                  ? 'bg-red-500'
                  : remainingPeriod === '1일 남음'
                    ? 'bg-pink-600'
                    : 'bg-green-500',
            ]"
          >
            {{ remainingPeriod }}
          </span>
        </div>
        <span class="text-sm text-gray-400">{{ status }}</span>
      </div>
    </div>
  </div>
</template>
