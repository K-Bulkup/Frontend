import { ref } from "vue";
import { Client } from "@stomp/stompjs";

const stompClient = ref(null);
const isConnected = ref(false);
const subscriptions = new Map();

// 환경별 WebSocket URL 설정
const getWebSocketURL = () => {
  // VITE_API_BASE_URL이 설정되어 있으면 그것을 우선 사용
  const baseURL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
      ? "http://43.201.172.152:8080"
      : "http://localhost:8080");

  // HTTP/HTTPS를 WS/WSS로 변환
  return (
    baseURL.replace(/^https?/, baseURL.startsWith("https") ? "wss" : "ws") +
    "/ws"
  );
};

export const useChatSocket = () => {
  const connectSocket = () => {
    return new Promise((resolve, reject) => {
      if (stompClient.value) {
        resolve();
        return;
      }

      const wsURL = getWebSocketURL();
      console.log("🔗 WebSocket URL:", wsURL);

      const client = new Client({
        webSocketFactory: () => {
          console.log("🔥 WebSocket 생성 시작");
          return new WebSocket(wsURL);
        },
        debug: (msg) => console.log("📋 STOMP DEBUG:", msg),
        onConnect: () => {
          console.log("✅ 연결 성공");
          isConnected.value = true;
          resolve();
        },
        onStompError: (frame) => {
          reject(new Error("STOMP 에러"));
        },
        onWebSocketError: (err) => {
          reject(new Error("웹소켓 에러"));
        },
        onDisconnect: () => {
          console.log("🔌 연결 해제됨");
        },
        reconnectDelay: 5000,
      });

      console.log("🚀 client.activate() 호출");
      client.activate();
      stompClient.value = client;

      setTimeout(() => {
        if (!isConnected.value) {
          reject(new Error("Connection timeout"));
        }
      }, 10000);
    });
  };

  const subscribeRoom = (roomId, onMessage) => {
    if (!stompClient.value || !isConnected.value) return;

    const subscription = stompClient.value.subscribe(
      `/topic/room/${roomId}`,
      (message) => {
        const payload = JSON.parse(message.body);
        onMessage(payload);
      },
    );

    subscriptions.set(roomId, subscription);
  };

  const safeSubsribeRoom = async (roomId, callback) => {
    if (!isConnected.value) {
      try {
        await connectSocket();
      } catch (e) {
        console.log("WebSocket 연결 실패: ", e);
        return;
      }
    }
    subscribeRoom(roomId, callback);
  };

  const unsubscribeRoom = (roomId) => {
    const subscription = subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      subscriptions.delete(roomId);
    }
  };

  const subscribeUserQueue = (userId, onMessage) => {
    if (!stompClient.value || !isConnected.value) return;

    const subscription = stompClient.value.subscribe(
      `/queue/user/${userId}`,
      (message) => {
        const payload = JSON.parse(message.body);
        onMessage(payload);
      },
    );

    subscriptions.set(`user-${userId}`, subscription);
  };

  const unsubscribeUserQueue = (userId) => {
    const subscription = subscriptions.get(`user-${userId}`);
    if (subscription) {
      subscription.unsubscribe();
      subscriptions.delete(`user-${userId}`);
    }
  };

  const sendMessage = (roomId, message, senderId) => {
    if (!stompClient.value || !isConnected.value) return;
    stompClient.value.publish({
      destination: "/app/chat/send-message",
      body: JSON.stringify({ roomId, message, senderId }),
    });
  };

  const disconnectSocket = () => {
    if (stompClient.value && isConnected.value) {
      stompClient.value.deactivate();
      stompClient.value = null;
      isConnected.value = false;
      subscriptions.clear();
    }
  };

  return {
    connectSocket,
    disconnectSocket,
    subscribeRoom,
    safeSubsribeRoom,
    unsubscribeRoom,
    subscribeUserQueue,
    unsubscribeUserQueue,
    sendMessage,
    isConnected,
  };
};
