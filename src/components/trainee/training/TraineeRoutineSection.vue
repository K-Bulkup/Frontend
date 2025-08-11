<script setup>
import { computed } from "vue";
import LockIcon from "@/assets/images/trainee/training/Lock.svg";

const props = defineProps({
  title: String, // 스트레칭 / 근력 / 유산소
  subtitle: String, // 금융 익히기 ...
  quests: { type: Array, default: () => [] }, // [{ id, name, completed, rewardPoint, typeLabel? }]
  isLocked: Boolean,
  isExpanded: Boolean,
  lockMessage: { type: String, default: "이전 섹션 완료 후 잠금 해제" },
});
const emit = defineEmits(["toggle", "routine-click"]);

// 백 연결 전 임시 하드코딩
const fallbackNames = [
  "주식 계좌 개설하기",
  "주식 계좌 개설하기가?",
  "주식 계좌 개설하기",
];
const fallbackTags = ["주관식", "OX", "실천형"];
const fallbackPts = [2, 1, 1];

const displayQuests = computed(() => {
  const base = props.quests?.length ? props.quests : Array(3).fill(null);
  return base.map((q, i) => ({
    id: q?.id ?? `demo-${i}`,
    name: q?.name ?? fallbackNames[i % fallbackNames.length],
    completed: !!q?.completed,
    rewardPoint: q?.rewardPoint ?? fallbackPts[i % fallbackPts.length],
    tag: q?.typeLabel ?? fallbackTags[i % fallbackTags.length],
  }));
});
</script>

<template>
  <section class="w-full">
    <!-- 플랫 헤더: 아이콘 큼 + 타이틀 옆 서브타이틀 -->
    <button class="flex w-full items-center gap-3 py-3" @click="emit('toggle')">
      <!-- 큰 아이콘 자리 -->
      <div class="h-12 w-12 rounded-xl bg-gray-900/80"></div>

      <!-- 타이틀 + 서브(같은 줄) -->
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <h3 class="truncate font-semibold text-white">{{ title }}</h3>
        <span class="shrink-0 text-caption text-gray-400">{{ subtitle }}</span>
      </div>

      <!-- 토글 -->
      <svg
        :class="[
          'h-4 w-4 text-gray-400 transition-transform',
          isExpanded ? 'rotate-180' : '',
        ]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m6 9 6 6 6-6"
        />
      </svg>
    </button>

    <!-- 잠금: 플랫(배경/보더 없음) + 흐릿한 텍스트 -->
    <div v-if="isLocked && isExpanded" class="px-1 pb-3">
      <div
        class="flex items-center justify-center gap-2 rounded-xl border border-gray-800 px-4 py-4"
      >
        <img :src="LockIcon" alt="locked" class="h-4 w-4 opacity-100" />
        <span class="text-caption text-gray-500">{{ lockMessage }}</span>
      </div>
    </div>

    <!-- 리스트: 플랫(배경/보더 제거) -->
    <div v-show="isExpanded && !isLocked" class="px-1 pb-3">
      <div
        v-for="q in displayQuests"
        :key="q.id"
        class="group flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
        @click="$emit('routine-click', q)"
      >
        <!-- 왼쪽: 이름 옆 태그(같은 줄) -->
        <div class="flex min-w-0 items-center gap-2">
          <p class="truncate text-white">{{ q.name }}</p>
          <span
            class="shrink-0 rounded-full border border-gray-600 bg-gray-600 px-2 py-0.5 text-caption text-white"
          >
            {{ q.tag }}
          </span>
        </div>

        <!-- 오른쪽: 미완료면 +점수, 완료면 체크 -->
        <div class="ml-3 flex items-center gap-2">
          <span
            v-if="!q.completed"
            class="rounded-full bg-primary/10 px-2 py-0.5 text-caption font-medium text-primary"
          >
            +{{ q.rewardPoint }}
          </span>
          <div
            v-else
            class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-black"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
