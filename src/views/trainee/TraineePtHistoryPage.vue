<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { ChevronLeftIcon, MessageCircleIcon } from "lucide-vue-next";
import dayjs from "dayjs";

import { useAuthStore } from "@/stores/auth";
import { getCounselingList } from "@/composables/api/useCounselingApi";
import { useChatSocket } from "@/composables/chat/useChatSocket";

import ChatListItem from "@/components/chat/ChatListItem.vue";

const router = useRouter();
const chatList = ref([]);

const authStore = useAuthStore();
const userId = 2;

const { subscribeUserQueue, unsubscribeUserQueue, connectSocket } =
  useChatSocket();

const formatTimestamp = (dateInput) => {
  const sendDate = dayjs(dateInput);
  const now = dayjs();

  if (!sendDate.isValid()) return "Invalid Date";

  if (sendDate.isSame(now, "day")) {
    return sendDate
      .format("A h:mm")
      .replace("AM", "오전")
      .replace("PM", "오후");
  } else if (sendDate.isSame(now.subtract(1, "day"), "day")) {
    return "어제";
  } else {
    return sendDate.format("MM/DD");
  }
};

const handleBack = () => router.back();

const handleChatClick = (chatData) => {
  router.push(`/trainee/mypage/pt-chat/${chatData.roomId}`);
};

const fetchChatList = async () => {
  try {
    const res = await getCounselingList();
    const data = res.data.data;

    chatList.value = data.map((item, index) => {
      const latestDate = item.latestAt
        ? new Date(
            item.latestAt[0],
            item.latestAt[1] - 1,
            item.latestAt[2],
            item.latestAt[3],
            item.latestAt[4],
            item.latestAt[5] || 0,
          )
        : null;

      const expiresDate = new Date(
        item.expiresAt[0],
        item.expiresAt[1] - 1,
        item.expiresAt[2],
        item.expiresAt[3],
        item.expiresAt[4],
        item.expiresAt[5] || 0,
      );

      const now = new Date();
      const diffMs = expiresDate.getTime() - now.getTime();

      let remainingLabel = "만료";
      let isExpired = true;

      if (diffMs > 0) {
        const diffMin = Math.floor(diffMs / 1000 / 60);
        const hours = Math.floor(diffMin / 60);
        const minutes = diffMin % 60;
        remainingLabel = `${hours}시간 ${minutes}분 남음`;
        isExpired = false;
      }

      return {
        id: index + 1,
        userName: item.traineeName,
        remainingDays: remainingLabel,
        courseTitle: item.trainingTitle,
        lastMessage: item.latestMessage ?? "(대화 없음)",
        timestamp: latestDate ? formatTimestamp(latestDate) : "",
        unreadCount: item.unreadCount,
        isExpired,
        roomId: item.roomId,
      };
    });
  } catch (error) {
    console.error("채팅 리스트 불러오기 실패:", error);
  }
};

onMounted(async () => {
  await connectSocket();
  await fetchChatList();

  subscribeUserQueue(userId, (summary) => {
    const index = chatList.value.findIndex(
      (chat) => chat.roomId === summary.roomId,
    );
    if (index !== -1) {
      chatList.value[index].lastMessage = summary.lastMessage;
      chatList.value[index].unreadCount = summary.unreadCount;
      chatList.value[index].timestamp = formatTimestamp(summary.sendAt);
      chatList.value.sort(
        (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
      );
      chatList.value = [...chatList.value]; // trigger reactivity
    }
  });
});

onBeforeUnmount(() => {
  unsubscribeUserQueue(userId);
});
</script>

<template>
  <div class="flex min-h-screen flex-col pb-16">
    <div
      class="flex items-center justify-between border-b border-gray-800 py-4"
    >
      <div class="flex items-center space-x-3">
        <button @click="handleBack" class="p-1">
          <ChevronLeftIcon class="h-6 w-6 text-white" />
        </button>
        <h1 class="text-lg font-semibold text-white">
          1:1 PT ({{ chatList.length }})
        </h1>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <ChatListItem
        v-for="chat in chatList"
        :key="chat.id"
        :chat-data="chat"
        :user-name="chat.userName"
        :remaining-days="chat.remainingDays"
        :course-title="chat.courseTitle"
        :last-message="chat.lastMessage"
        :timestamp="chat.timestamp"
        :unread-count="chat.unreadCount"
        :is-expired="chat.isExpired"
        @click="handleChatClick"
      />

      <div
        v-if="chatList.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <MessageCircleIcon class="mb-4 h-16 w-16 text-gray-600" />
        <p class="text-lg text-gray-400">채팅이 없습니다</p>
      </div>

      <div v-else class="py-6 text-center">
        <p class="text-sm text-gray-500">더 이상 채팅이 없습니다</p>
      </div>
    </div>
  </div>
</template>
