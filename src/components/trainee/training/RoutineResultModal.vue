<script setup>
import { computed } from "vue"; // ✅ 추가

const props = defineProps({
  isVisible: { type: Boolean, required: true },
  status: { type: String, default: "success" }, // 'success' | 'failure'
  reward: { type: Number, default: 1 },
  commentary: { type: String, default: "" }, // ✅ 추가
});

const emit = defineEmits(["close", "retry"]);

const handlePrimary = () => {
  if (props.status === "success") emit("close", "primary");
  else emit("retry");
};

// ✅ commentary를 줄 단위로 파싱(빈 줄/공백 제거). 비어있으면 기본 메시지 사용
const parsedCommentary = computed(() => {
  const lines = String(props.commentary ?? "")
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return lines.length
    ? lines
    : [
        "정답이 일치하지 않았습니다",
        "사진이 명확하지 않거나 판독이 어려웠습니다",
      ];
});
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-[999] flex items-center justify-center bg-black/15 backdrop-blur-md backdrop-brightness-75 backdrop-saturate-150"
    role="dialog"
    aria-modal="true"
    @click.self="$emit('close', 'dismiss')"
    style="-webkit-backdrop-filter: blur(12px)"
  >
    <!-- 공통 카드 -->
    <div
      class="w-[90%] max-w-[340px] rounded-2xl bg-[#1A1A1A] p-5 text-center text-white shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
    >
      <!-- 닫기 -->
      <button
        class="mb-1 ml-auto block rounded-full p-1 text-gray-400 hover:text-white"
        aria-label="닫기"
        @click="$emit('close', 'dismiss')"
      >
        <!-- X 아이콘 -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <!-- 상단 원형 아이콘 -->
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        :class="status === 'success' ? 'bg-primary' : 'bg-[#3A3A3A]'"
      >
        <svg
          v-if="status === 'success'"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M20 6L9 17l-5-5"
            stroke="#0B0B0B"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="#0B0B0B"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <!-- 타이틀/서브텍스트 -->
      <template v-if="status === 'success'">
        <h2 class="text-[18px] font-extrabold text-primary">리워드 획득!</h2>
        <p class="mt-1 text-body2 text-gray-300">
          루틴을 성공적으로 완료했습니다
        </p>

        <!-- 포인트 박스 -->
        <div class="mt-5 rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
          <div class="text-body3 text-gray-400">획득 포인트</div>
          <div class="mt-1 text-[22px] font-extrabold text-white">
            {{ reward }}P
          </div>
        </div>

        <button
          class="mt-6 w-full rounded-lg bg-primary py-3 font-bold text-black hover:opacity-90"
          @click="handlePrimary"
        >
          확인
        </button>
      </template>

      <template v-else>
        <h2 class="text-[18px] font-extrabold text-gray-100">
          리워드 획득 실패
        </h2>
        <p class="mt-1 text-body2 text-gray-300">루틴을 완료하지 못했습니다</p>

        <!-- 안내 박스 -->
        <div
          class="mt-5 space-y-2 rounded-xl border border-[#2A2A2A] bg-[#141414] p-4 text-left"
        >
          <p class="text-body2 text-gray-300">해설</p>
          <ul class="list-disc space-y-1 pl-5 text-body2 text-gray-400">
            <li v-for="(line, idx) in parsedCommentary" :key="idx">
              {{ line }}
            </li>
          </ul>
        </div>

        <button
          class="mt-6 w-full rounded-lg bg-primary py-3 font-bold text-black hover:opacity-90"
          @click="handlePrimary"
        >
          다시 시도하기
        </button>
      </template>
    </div>
  </div>
</template>
