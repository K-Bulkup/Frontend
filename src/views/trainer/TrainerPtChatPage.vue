<script setup>
import { ref, computed, onMounted } from "vue";
import ChatHeader from "@/components/chat/ChatHeader.vue";
import ChatBubble from "@/components/chat/ChatBubble.vue";
import ChatInput from "@/components/chat/ChatInput.vue";

// Reactive data
const messages = ref([
  {
    id: 1,
    text: "자산을 분석해주세요",
    timestamp: "오후 2:30",
    isOwn: true,
  },
  {
    id: 2,
    text: "안녕하세요! 홍길동님의 자산을 분석해드리겠습니다.",
    timestamp: "오후 2:30",
    isOwn: false,
  },
]);

const chatData = ref({
  userName: "김헬스",
  remainingPeriod: "1일 남음",
  status: "온라인",
});

const activeTab = ref("assets");

// Methods
const handleBack = () => {
  console.log("Back button clicked");
  // Handle navigation back
};

const handleSendMessage = (messageText) => {
  const newMessage = {
    id: messages.value.length + 1,
    text: messageText,
    timestamp: new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    isOwn: true,
  };
  messages.value.push(newMessage);

  // Simulate response (optional)
  setTimeout(() => {
    const responseMessage = {
      id: messages.value.length + 1,
      text: "메시지를 받았습니다. 분석 중입니다...",
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      isOwn: false,
    };
    messages.value.push(responseMessage);
  }, 1000);
};

onMounted(() => {
  // Scroll to bottom of messages
  const messagesContainer = document.querySelector(".overflow-y-auto");
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <ChatHeader
      :user-name="chatData.userName"
      :remaining-period="chatData.remainingPeriod"
      :status="chatData.status"
      @back="handleBack"
    />

    <div class="flex-1 overflow-y-auto p-4 pb-20">
      <ChatBubble
        v-for="message in messages"
        :key="message.id"
        :message="message.text"
        :timestamp="message.timestamp"
        :is-own="message.isOwn"
      />
    </div>

    <ChatInput placeholder="메시지를 입력하세요..." @send="handleSendMessage" />
  </div>
</template>
