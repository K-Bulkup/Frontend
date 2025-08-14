<script setup>
import { computed } from "vue";
import { UserIcon } from "lucide-vue-next";

const props = defineProps({
  chatData: { type: Object, required: true },
  userName: { type: String, required: true },
  courseTitle: { type: String, required: true },
  lastMessage: { type: String, required: true },
  timestamp: { type: String, required: true },
  unreadCount: { type: Number, default: 0 },
  status: { type: String, required: true }, // "예약완료" | "진행중" | "완료" | "취소"
  opponentProfileUrl: { type: String, default: "" },
});

const emit = defineEmits(["click"]);

const isClickable = computed(() => props.status !== "예약완료");

const statusClasses = computed(() => {
  switch (props.status) {
    case "예약완료":
      return "border-primary bg-primary/20 text-white";
    case "진행중":
      return "border-green-500 bg-green-500/20 text-green-300";
    case "완료":
      return "border-error bg-error/20 text-gray-300";
    case "취소":
      return "border-gray-600 bg-gray-600/30 text-gray-300";
    default:
      return "border-gray-600 bg-gray-600/30 text-gray-300";
  }
});

function handleClick() {
  if (!isClickable.value) return;
  emit("click", props.chatData);
}
</script>

<template>
  <div
    class="my-4 flex items-center rounded-r15 bg-gray-custom p-4 transition-opacity"
    :class="
      isClickable
        ? 'cursor-pointer hover:bg-opacity-70'
        : 'cursor-not-allowed opacity-70'
    "
    @click="handleClick"
  >
    <!-- 프로필 -->
    <div class="relative mr-4">
      <div
        class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-600"
      >
        <template v-if="opponentProfileUrl">
          <img
            :src="opponentProfileUrl"
            alt="상대방 프로필"
            class="h-12 w-12 rounded-full object-cover"
          />
        </template>
        <template v-else>
          <UserIcon class="h-6 w-6 text-gray-300" />
        </template>
      </div>
      <div
        v-if="unreadCount > 0"
        class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error"
      >
        <span class="text-body4 font-normal text-white">
          {{ unreadCount > 9 ? "9+" : unreadCount }}
        </span>
      </div>
    </div>

    <!-- 내용 -->
    <div class="min-w-0 flex-1">
      <div class="mb-1 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-input font-bold text-white">{{ userName }}</span>
          <div class="rounded-xl bg-gray-600 px-3">
            <span class="text-body3 font-normal text-white">{{
              courseTitle
            }}</span>
          </div>
        </div>
        <span
          class="relative -top-[1px] px-1 text-body3 font-normal text-gray-500"
        >
          {{ timestamp }}
        </span>
      </div>

      <div class="flex items-end justify-between">
        <div class="mr-2 flex-1">
          <p class="break-words text-body3 font-normal text-gray-500">
            {{ lastMessage }}
          </p>
        </div>
        <!-- 상태 배지 -->
        <div class="flex-shrink-0">
          <div class="rounded-pill border px-3" :class="statusClasses">
            <span class="text-button font-normal">{{ status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
