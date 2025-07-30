<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import { awaitUserReady } from "@/composables/user/awaitUserReady";
import {
  getChatHistory,
  readMessages,
  getCounselingDetail,
} from "@/composables/api/useCounselingApi";
import { useChatSocket } from "@/composables/chat/useChatSocket";

import ChatHeader from "@/components/chat/ChatHeader.vue";
import ChatBubble from "@/components/chat/ChatBubble.vue";
import ChatInput from "@/components/chat/ChatInput.vue";

dayjs.locale("ko");

const route = useRoute();
const router = useRouter();
const roomId = route.params.roomId;

const userName = ref("");
const userProfileUrl = ref(null);
const status = ref("");
const expiresAt = ref(null);
const userId = ref(null);

const messages = ref([]);
const messageContainer = ref(null);

const { safeSubsribeRoom, unsubscribeRoom, sendMessage } = useChatSocket();

const handleSendMessage = (text) => {
  sendMessage(roomId, text, userId.value);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
};

const groupByDate = (messages) => {
  const result = {};
  for (const msg of messages) {
    const date = dayjs(msg.sendAt).format("YYYY년 M월 D일 dddd");
    if (!result[date]) result[date] = [];
    result[date].push({
      ...msg,
      timestamp: dayjs(msg.sendAt)
        .format("A h:mm")
        .replace("AM", "오전")
        .replace("PM", "오후"),
    });
  }
  return result;
};

const groupedMessages = computed(() => groupByDate(messages.value));

onMounted(async () => {
  try {
    userId.value = await awaitUserReady();

    const response = await getChatHistory(roomId, userId.value);
    const chatList = response.data?.data || [];

    messages.value = chatList.map((msg) => {
      const [year, month, day, hour, minute, second] = msg.sendAt;
      return {
        id: msg.id,
        text: msg.message,
        isOwn: String(msg.senderId) === String(userId.value),
        sendAt: new Date(year, month - 1, day, hour, minute, second),
      };
    });

    const detailRes = await getCounselingDetail(roomId, userId.value);
    const detail = detailRes.data?.data;
    status.value = detail.status;
    userName.value = detail.userName;
    userProfileUrl.value = detail.userProfileUrl;

    const [year, month, day, hour, minute, second] = detail.expiresAt;
    expiresAt.value = new Date(year, month - 1, day, hour, minute, second);

    safeSubsribeRoom(roomId, async (payload) => {
      messages.value.push({
        id: Date.now(),
        text: payload.message,
        isOwn: String(payload.senderId) === String(userId.value),
        sendAt: new Date(payload.sendAt),
      });

      if (String(payload.senderId) !== String(userId.value)) {
        try {
          await readMessages(roomId, userId.value);
        } catch (err) {
          console.error("읽음 처리 실패:", err);
        }
      }

      scrollToBottom();
    });

    scrollToBottom();
  } catch (err) {
    console.error("초기화 실패:", err);
  }
});

onBeforeUnmount(() => {
  unsubscribeRoom(roomId);
});
</script>

<template>
  <div class="flex h-screen flex-col">
    <ChatHeader
      :user-name="userName"
      :user-profile-url="userProfileUrl"
      :expires-at="expiresAt"
      @back="router.push('/common/pt-history')"
    />

    <div ref="messageContainer" class="flex-1 overflow-y-auto p-4">
      <div v-for="(group, date) in groupedMessages" :key="date">
        <div class="my-4 text-center text-xs text-gray-400">{{ date }}</div>
        <ChatBubble
          v-for="message in group"
          :key="message.id"
          :message="message.text"
          :is-own="message.isOwn"
          :timestamp="message.timestamp"
        />
      </div>
    </div>

    <div class="border-t border-gray-700">
      <ChatInput
        :disabled="status === '만료'"
        :placeholder="
          status === '만료' ? '만료된 상담입니다...' : '메시지를 입력하세요...'
        "
        @send="handleSendMessage"
      />
    </div>
  </div>
</template>
