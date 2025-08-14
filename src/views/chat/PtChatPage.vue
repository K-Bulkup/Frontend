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
import { getTraineeAssetByRoomId } from "@/composables/api/useAssetApi";
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

// 소켓
const {
  safeSubsribeRoom, // 기존 오탈자 함수(호환)
  safeSubscribeRoom, // 새 별칭 (둘 중 아무거나 사용 가능)
  unsubscribeRoom,
  subscribeUserQueue, // 옵션: 필요시 요약 큐 구독
  sendMessage,
} = useChatSocket();

const handleSendMessage = (text) => {
  if (!text || !text.trim()) return;
  sendMessage(roomId, text, userId.value);
};

// 안전한 날짜 파서
const parseSendAt = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) {
    const [y, m, d, H = 0, M = 0, S = 0] = val;
    return new Date(y, (m ?? 1) - 1, d ?? 1, H, M, S);
    // JS Date: month는 0-based
  }
  if (typeof val === "string") {
    const t = new Date(val);
    if (!Number.isNaN(t.getTime())) return t;
  }
  try {
    const t = new Date(val); // number timestamp 등
    if (!Number.isNaN(t.getTime())) return t;
  } catch (_) {}
  return null;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
};

const columnMappings = {
  transactions: {
    transactionType: "거래유형",
    amount: "금액",
    transactionCategory: "거래분류",
    tranDate: "거래일자",
  },
  snapshots: {
    balance: "잔액",
    snapshotDate: "스냅샷일자",
  },
  composition: {
    기타: "기타",
    주식: "주식",
    채권: "채권",
    펀드: "펀드",
    "현금 및 예금": "현금 및 예금",
  },
};

const excludeColumns = {
  transactions: ["transactionId", "userId"],
  snapshots: ["snapshotId", "userId"],
};

const jsonToCsv = (jsonArray, dataType) => {
  if (!jsonArray || jsonArray.length === 0) {
    return null;
  }
  const allHeaders = Object.keys(jsonArray[0]);
  const originalHeaders = allHeaders.filter(
    (header) => !excludeColumns[dataType]?.includes(header),
  );

  const koreanHeaders = originalHeaders.map(
    (header) => columnMappings[dataType]?.[header] || header,
  );

  const csvContent = [
    koreanHeaders.join(","), // 한글 헤더
    ...jsonArray.map((row) =>
      originalHeaders
        .map((header) => {
          let value = row[header];

          // 배열 → 날짜 배열 처리
          if (Array.isArray(value)) {
            if (header.includes("Date") || header.includes("date")) {
              const [year, month, day] = value;
              value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            } else {
              value = value.join("/");
            }
          }

          // 거래유형 한글화(이미 한글이면 그대로)
          if (header === "transactionType") {
            value =
              value === "입금" ? "입금" : value === "출금" ? "출금" : value;
          }

          if (typeof value === "string" && value.includes(",")) {
            value = `"${value}"`;
          }

          return value;
        })
        .join(","),
    ),
  ].join("\n");

  return csvContent;
};

const objectToCsv = (obj) => {
  if (!obj || typeof obj !== "object") return null;

  const entries = Object.entries(obj);
  const csvContent = [
    "자산분류,비율(%)",
    ...entries.map(([key, value]) => {
      const koreanKey = columnMappings.composition[key] || key;
      return `${koreanKey},${value}`;
    }),
  ].join("\n");

  return csvContent;
};

const downloadCsv = (csvContent, filename) => {
  if (!csvContent) return;

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const handleDownloadAssets = async () => {
  try {
    const response = await getTraineeAssetByRoomId(roomId);
    const data = response.data;

    if (!data || !response.success) {
      console.error("데이터를 불러올 수 없습니다.");
      return;
    }

    const { transactions, snapshots, composition } = data;
    const today = new Date().toISOString().split("T")[0];

    if (transactions && transactions.length > 0) {
      const csv = jsonToCsv(transactions, "transactions");
      downloadCsv(csv, `${userName.value}_거래내역_${today}.csv`);
    }

    if (snapshots && snapshots.length > 0) {
      const csv = jsonToCsv(snapshots, "snapshots");
      downloadCsv(csv, `${userName.value}_잔액스냅샷_${today}.csv`);
    }

    if (composition && composition.assetComposition) {
      const csv = objectToCsv(composition.assetComposition);
      downloadCsv(csv, `${userName.value}_자산구성_${today}.csv`);
    }

    console.log("CSV 파일 다운로드가 완료되었습니다.");
  } catch (err) {
    console.error("자산 불러오기 실패:", err);
  }
};

const groupByDate = (msgs) => {
  const result = {};
  for (const msg of msgs) {
    if (!msg.sendAt) continue; // 날짜 없는 메시지 스킵(안전)
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

    // 초기 히스토리 로딩
    const response = await getChatHistory(roomId);
    const chatList = response?.data?.data || [];
    messages.value = chatList.map((msg) => ({
      id: msg.id,
      text: msg.message,
      isOwn: String(msg.senderId) === String(userId.value),
      sendAt: parseSendAt(msg.sendAt),
    }));

    // 상담 상세
    const detailRes = await getCounselingDetail(roomId);
    const detail = detailRes?.data?.data || {};

    status.value = detail?.status ?? "";
    userName.value = detail?.opponentUserName ?? "";

    userProfileUrl.value = {
      me: detail?.myProfileUrl ?? null,
      opponent: detail?.opponentProfileUrl ?? null,
    };

    // 만료일자 파싱 (널가드)
    expiresAt.value = parseSendAt(detail?.expiresAt);

    // 방 토픽 구독 (오탈자 함수 유지)
    await safeSubsribeRoom(roomId, async (payload) => {
      console.log("📥 [room] payload:", payload);

      const parsedDate = parseSendAt(payload?.sendAt);
      messages.value.push({
        id: Date.now(),
        text: payload?.message,
        isOwn: String(payload?.senderId) === String(userId.value),
        sendAt: parsedDate,
      });

      // 상대가 보낸 메시지면 읽음 처리
      if (String(payload?.senderId) !== String(userId.value)) {
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
      :user-profile-url="userProfileUrl?.opponent"
      :expires-at="expiresAt"
      :room-id="roomId"
      buttonText="자산 다운로드"
      :button-handler="handleDownloadAssets"
      @back="router.push('/common/pt/history')"
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
          :profile-url="
            message.isOwn ? userProfileUrl?.me : userProfileUrl?.opponent
          "
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
