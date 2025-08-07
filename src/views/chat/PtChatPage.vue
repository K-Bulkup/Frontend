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

const columnMappings = {
  // Transactions 테이블 매핑 (ID 컬럼 제외)
  transactions: {
    transactionType: "거래유형",
    amount: "금액",
    transactionCategory: "거래분류",
    tranDate: "거래일자",
  },
  // Snapshots 테이블 매핑 (ID 컬럼 제외)
  snapshots: {
    balance: "잔액",
    snapshotDate: "스냅샷일자",
  },
  // Composition 매핑
  composition: {
    기타: "기타",
    주식: "주식",
    채권: "채권",
    펀드: "펀드",
    "현금 및 예금": "현금 및 예금",
  },
};

// 제외할 컬럼 정의
const excludeColumns = {
  transactions: ["transactionId", "userId"],
  snapshots: ["snapshotId", "userId"],
};

const jsonToCsv = (jsonArray, dataType) => {
  if (!jsonArray || jsonArray.length === 0) {
    return null;
  }

  // 원본 헤더 추출 및 제외할 컬럼 필터링
  const allHeaders = Object.keys(jsonArray[0]);
  const originalHeaders = allHeaders.filter(
    (header) => !excludeColumns[dataType]?.includes(header),
  );

  // 한글 헤더로 변환
  const koreanHeaders = originalHeaders.map((header) => {
    return columnMappings[dataType]?.[header] || header;
  });

  // CSV 문자열 생성
  const csvContent = [
    koreanHeaders.join(","), // 한글 헤더 행
    ...jsonArray.map((row) =>
      originalHeaders
        .map((header) => {
          let value = row[header];

          // 배열 데이터 처리 (날짜 배열의 경우)
          if (Array.isArray(value)) {
            if (header.includes("Date") || header.includes("date")) {
              // 날짜 배열을 YYYY-MM-DD 형식으로 변환
              const [year, month, day] = value;
              value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            } else {
              value = value.join("/");
            }
          }

          // 거래유형 및 거래분류 한글화
          if (header === "transactionType") {
            value = value === "입금" ? "입금" : "출금";
          }

          // 문자열에 쉼표가 있는 경우 따옴표로 감싸기
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

// 객체를 CSV로 변환하는 함수 (composition 데이터용) - 한글 적용
const objectToCsv = (obj) => {
  if (!obj || typeof obj !== "object") {
    return null;
  }

  const entries = Object.entries(obj);
  const csvContent = [
    "자산분류,비율(%)", // 한글 헤더
    ...entries.map(([key, value]) => {
      // 자산분류명도 한글로 유지
      const koreanKey = columnMappings.composition[key] || key;
      return `${koreanKey},${value}`;
    }),
  ].join("\n");

  return csvContent;
};

// 파일 다운로드 함수 (기존과 동일)
const downloadCsv = (csvContent, filename) => {
  if (!csvContent) return;

  // BOM 추가 (Excel에서 한글이 깨지지 않도록)
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

// 수정된 handleDownloadAssets 메서드
const handleDownloadAssets = async () => {
  try {
    const response = await getTraineeAssetByRoomId(roomId);
    const data = response.data;

    if (!data || !response.success) {
      console.error("데이터를 불러올 수 없습니다.");
      return;
    }

    const { transactions, snapshots, composition } = data;

    // 현재 날짜로 파일명 생성
    const today = new Date().toISOString().split("T")[0];

    // 1. Transactions CSV 생성 및 다운로드
    if (transactions && transactions.length > 0) {
      const transactionsCsv = jsonToCsv(transactions, "transactions");
      downloadCsv(transactionsCsv, `${userName.value}_거래내역_${today}.csv`);
    }

    // 2. Snapshots CSV 생성 및 다운로드
    if (snapshots && snapshots.length > 0) {
      const snapshotsCsv = jsonToCsv(snapshots, "snapshots");
      downloadCsv(snapshotsCsv, `${userName.value}_잔액스냅샷_${today}.csv`);
    }

    // 3. Asset Composition CSV 생성 및 다운로드
    if (composition && composition.assetComposition) {
      const compositionCsv = objectToCsv(composition.assetComposition);
      downloadCsv(compositionCsv, `${userName.value}_자산구성_${today}.csv`);
    }

    console.log("CSV 파일 다운로드가 완료되었습니다.");
  } catch (err) {
    console.error("자산 불러오기 실패:", err);
  }
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

    const response = await getChatHistory(roomId);
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

    const detailRes = await getCounselingDetail(roomId);
    const detail = detailRes.data?.data;

    status.value = detail.status;
    userName.value = detail.opponentUserName;
    userProfileUrl.value = {
      me: detail.myProfileUrl,
      opponent: detail.opponentProfileUrl,
    };

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
      :user-profile-url="userProfileUrl?.opponent"
      :expires-at="expiresAt"
      :room-id="roomId"
      buttonText="자산 다운로드"
      :button-handler="handleDownloadAssets"
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
          :profile-url="
            message.isOwn ? userProfileUrl.me : userProfileUrl.opponent
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
