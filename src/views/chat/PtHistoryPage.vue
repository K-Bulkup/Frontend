<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { MessageCircleIcon } from "lucide-vue-next";
import dayjs from "dayjs";

import { getCounselingList } from "@/composables/api/useCounselingApi";
import { useChatSocket } from "@/composables/chat/useChatSocket";

import ChatListItem from "@/components/chat/ChatListItem.vue";
import { awaitUserReady } from "@/composables/user/awaitUserReady";

const router = useRouter();
const chatList = ref([]);
const userId = ref(null);

const { subscribeUserQueue, unsubscribeUserQueue, connectSocket } =
  useChatSocket();

const formatTimestamp = (dateInput) => {
  const sendDate = dayjs(dateInput);
  const now = dayjs();
  if (!sendDate.isValid()) return "";

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

const goBack = () => router.back();

const handleChatClick = (chatData) => {
  router.push(`/common/pt/${chatData.roomId}`);
};

const toDateFromArray = (arr) =>
  arr
    ? new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5] || 0)
    : null;

const fetchChatList = async () => {
  try {
    const res = await getCounselingList();
    const data = res.data.data;

    chatList.value = data.map((item, index) => {
      const latestDate = item.latestAt ? toDateFromArray(item.latestAt) : null;

      return {
        id: index + 1,
        userName: item.opponentName,
        courseTitle: item.trainingTitle,
        lastMessage: item.latestMessage ?? "(대화 없음)",
        timestamp: latestDate ? formatTimestamp(latestDate) : "",
        latestMs: latestDate ? latestDate.getTime() : 0, // 정렬용
        unreadCount: item.unreadCount ?? 0,
        roomId: item.roomId,
        opponentProfileUrl: item.opponentProfileUrl,
        status: item.status, // "예약완료" | "진행중" | "완료" | "취소"
      };
    });

    // 최신 순 정렬
    chatList.value.sort((a, b) => b.latestMs - a.latestMs);
  } catch (error) {
    console.error("채팅 리스트 불러오기 실패:", error);
  }
};

onMounted(async () => {
  userId.value = await awaitUserReady();

  await connectSocket();
  await fetchChatList();

  // 실시간 요약 수신
  subscribeUserQueue(userId.value, (summary) => {
    const index = chatList.value.findIndex(
      (chat) => chat.roomId === summary.roomId,
    );
    const sendAtDate = dayjs(summary.sendAt).toDate();

    if (index !== -1) {
      chatList.value[index].lastMessage = summary.lastMessage;
      chatList.value[index].unreadCount = summary.unreadCount;
      chatList.value[index].timestamp = formatTimestamp(sendAtDate);
      chatList.value[index].latestMs = sendAtDate.getTime();

      // 상태가 바뀌는 경우(예: 예약완료 → 진행중 등) 내려오면 반영
      if (summary.status) {
        chatList.value[index].status = summary.status;
      }

      chatList.value.sort((a, b) => b.latestMs - a.latestMs);
      chatList.value = [...chatList.value]; // 리액티브 갱신
    }
  });
});

onBeforeUnmount(() => {
  if (userId.value) unsubscribeUserQueue(userId.value);
});
</script>

<template>
  <div class="flex min-h-screen flex-col px-2 pb-24 pt-4">
    <div class="flex-1 overflow-y-auto">
      <ChatListItem
        v-for="chat in chatList"
        :key="chat.id"
        :chat-data="chat"
        :user-name="chat.userName"
        :course-title="chat.courseTitle"
        :last-message="chat.lastMessage"
        :timestamp="chat.timestamp"
        :unread-count="chat.unreadCount"
        :status="chat.status"
        :opponent-profile-url="chat.opponentProfileUrl"
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
