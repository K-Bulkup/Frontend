<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import { awaitUserReady } from "@/composables/user/awaitUserReady";
import {
  getAiChatHistory,
  requestAiConsulting,
} from "@/composables/api/useAiChatApi";
import { getTraineeAsset } from "@/composables/api/useAssetApi";

import ChatHeader from "@/components/chat/ChatHeader.vue";
import ChatBubble from "@/components/chat/ChatBubble.vue";
import ChatInput from "@/components/chat/ChatInput.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue"; // ← 추가

import profileImg from "@/assets/images/mascot/profile.png";

dayjs.locale("ko");

const router = useRouter();

const userId = ref(null);
const remainingChats = ref(0);
const assets = ref(null);

const status = computed(() => (remainingChats.value <= 0 ? "만료" : "활성"));
const placeholder = computed(() =>
  status.value === "만료"
    ? "하루 채팅 횟수를 초과했습니다..."
    : "메시지를 입력하세요...",
);
const disabled = computed(() => status.value === "만료");

const messages = ref([]);
const messageContainer = ref(null);
const isButtonDisabled = computed(() => remainingChats.value <= 0);

const showOverlay = ref(false);

const fetchAssets = async () => {
  try {
    const response = await getTraineeAsset();
    assets.value = response.data.data;
  } catch (error) {
    console.error("자산 데이터 불러오기 실패:", error);
  }
};

const formatAiSections = (s) => {
  if (!s) return s;
  let t = String(s).replace(/\r\n/g, "\n").trim();
  t = t.replace(/\n\[(분석|개선점|조언)\]\n/g, (_m, sec) => `\n[${sec}]\n`);
  t = t.replace(/^\n+/, "");
  return t;
};

const handleSendMessage = async (
  text,
  isAiChat = false,
  profileUrl = "",
  isAsset = false,
) => {
  const messageToSend =
    isAsset && assets.value ? JSON.stringify(assets.value) : text;

  const userMsg = {
    id: Date.now(),
    text,
    isOwn: true,
    sendAt: new Date(),
    isAiChat,
    profileUrl,
  };
  messages.value.push(userMsg);
  scrollToBottom();

  showOverlay.value = true;

  try {
    const aiText = await requestAiConsulting(messageToSend, isAsset);
    remainingChats.value = aiText.remainingChats;

    const raw = aiText.choices[0].message.content;
    const formatted = formatAiSections(raw);

    messages.value.push({
      id: Date.now() + 1,
      text: formatted,
      isOwn: false,
      sendAt: new Date(),
      isAiChat,
      profileUrl: profileImg,
    });

    scrollToBottom();
  } catch (err) {
    messages.value.push({
      id: Date.now() + 2,
      text: "[금육이 응답 실패]",
      isOwn: false,
      sendAt: new Date(),
      isAiChat,
      profileUrl: profileImg,
    });
    scrollToBottom();
  } finally {
    showOverlay.value = false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
};

const groupByDate = (messagesArr) => {
  const result = {};
  for (const msg of messagesArr) {
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

    const response = await getAiChatHistory();
    const chatList = response.data?.data?.chatMessages || [];
    remainingChats.value = response.data?.data?.remainingChats || 0;

    messages.value = chatList.map((msg) => {
      const [year, month, day, hour, minute, second] = msg.sendAt;
      const isOwn = msg.role === "user";
      return {
        id: msg.id,
        text: isOwn ? msg.message : formatAiSections(msg.message),
        isOwn,
        sendAt: new Date(year, month - 1, day, hour, minute, second),
      };
    });

    scrollToBottom();
  } catch (err) {
    console.error("초기화 실패:", err);
  }
});

const handleFetchAssetsAndSendMessage = async () => {
  await fetchAssets();
  handleSendMessage("자산 정보를 전송했습니다.", true, null, true);
};
</script>

<template>
  <div class="flex h-screen flex-col">
    <ChatHeader
      user-name="금육이"
      :user-profile-url="profileImg"
      :isAiChat="true"
      buttonText="자산 전송하기"
      :buttonHandler="handleFetchAssetsAndSendMessage"
      :buttonDisabled="isButtonDisabled"
      @back="router.push('/trainee/asset')"
    />

    <div ref="messageContainer" class="flex-1 overflow-y-auto p-4">
      <div v-for="(group, date) in groupedMessages" :key="date">
        <div class="my-4 text-center text-xs text-gray-400">{{ date }}</div>
        <ChatBubble
          v-for="message in group"
          :key="message.id"
          :isAiChat="true"
          :message="message.text"
          :is-own="message.isOwn"
          :timestamp="message.timestamp"
        />
      </div>
    </div>

    <div class="border-t border-gray-700">
      <ChatInput
        :disabled="disabled"
        :placeholder="placeholder"
        :remaining-chats="remainingChats"
        :isAiChat="true"
        @send="handleSendMessage"
      />
    </div>

    <!-- 중앙 로딩 오버레이 -->
    <LoadingOverlay :show="showOverlay" title="금육이가 답변 중입니다" />
  </div>
</template>
