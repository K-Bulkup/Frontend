<script setup>
import { computed, reactive, watch, onMounted } from "vue";
import LockIcon from "@/assets/images/trainee/training/Lock.svg";
import { getRoutineDetail } from "@/composables/api/trainee/training/routineDetailAPI";
import CategoryIconBox from "@/components/common/CategoryIconBox.vue";

import stretchingIcon from "@/assets/images/mascot/routine/Geumyuk_stretching.png";
import strengthIcon from "@/assets/images/mascot/routine/Geumyuk_strength.png";
import cardioIcon from "@/assets/images/mascot/routine/Geumyuk_cardio.png";

const props = defineProps({
  title: String,
  subtitle: String,
  quests: { type: Array, default: () => [] },
  isLocked: Boolean,
  isExpanded: Boolean,
  lockMessage: { type: String, default: "이전 섹션 완료 후 잠금 해제" },
});
const emit = defineEmits(["toggle", "routine-click"]);

const iconSrc = computed(() => {
  switch (props.title) {
    case "스트레칭":
      return stretchingIcon;
    case "근력":
      return strengthIcon;
    case "유산소":
      return cardioIcon;
    default:
      return "";
  }
});

// 타입 코드 → 라벨 매핑
const TYPE_LABELS = { SHORT_ANSWER: "주관식", OX: "OX", PHOTO: "실천형" };
const toTypeCode = (v) => String(v ?? "").toUpperCase();

// 데모 폴백
const fallbackNames = [
  "주식 계좌 개설하기",
  "주식 계좌 개설하기가?",
  "주식 계좌 개설하기",
];
const fallbackTags = ["주관식", "OX", "실천형"];
const fallbackPts = [2, 1, 1];

// 루틴 상세에서 가져온 타입 라벨 캐시
const fetchedTypeLabelById = reactive({});
// 중복 호출 방지용 프라미스 캐시
const inflight = new Map();

async function fetchTypeLabel(routineId) {
  if (!routineId) return undefined;
  if (fetchedTypeLabelById[routineId]) return fetchedTypeLabelById[routineId];
  if (inflight.has(routineId)) return inflight.get(routineId);

  const p = (async () => {
    try {
      const res = await getRoutineDetail(routineId);
      const raw = res?.data;
      const code = toTypeCode(raw?.quizType);
      const label = TYPE_LABELS[code] ?? "주관식";
      fetchedTypeLabelById[routineId] = label;
      return label;
    } catch (e) {
      fetchedTypeLabelById[routineId] = "주관식";
      return "주관식";
    } finally {
      inflight.delete(routineId);
    }
  })();

  inflight.set(routineId, p);
  return p;
}

async function prefetchMissingTypes() {
  if (!props.isExpanded || props.isLocked) return;
  if (!Array.isArray(props.quests) || props.quests.length === 0) return;

  // type 또는 typeLabel이 없는 아이템만 선별
  const targets = props.quests.filter(
    (q) =>
      q &&
      q.id &&
      !q.typeLabel &&
      !TYPE_LABELS[toTypeCode(q.quizType)] &&
      !fetchedTypeLabelById[q.id],
  );

  // 과도한 동시요청 방지: 순차 처리(필요하면 병렬도 OK)
  for (const q of targets) {
    await fetchTypeLabel(String(q.id));
  }
}

// 섹션 펼침/퀘스트 변경 시 프리패치
watch(
  () => [props.isExpanded, props.isLocked, props.quests?.length],
  () => prefetchMissingTypes(),
  { immediate: true },
);
onMounted(() => prefetchMissingTypes());

const hasRealQuests = computed(
  () => Array.isArray(props.quests) && props.quests.length > 0,
);

const displayQuests = computed(() => {
  if (hasRealQuests.value) {
    return props.quests.map((q, i) => {
      const typeCode = toTypeCode(q?.quizType);
      const tag =
        q?.typeLabel ??
        TYPE_LABELS[typeCode] ??
        undefined ??
        fetchedTypeLabelById[String(q?.id)] ??
        "주관식";

      return {
        id: q?.id ?? `item-${i}`,
        name: q?.name ?? `루틴 ${i + 1}`,
        completed: !!q?.completed,
        rewardPoint: q?.rewardPoint ?? 0,
        tag,
      };
    });
  }

  // 데모/빈 리스트일 때만 폴백 카드 사용
  const base = Array(3).fill(null);
  return base.map((_, i) => ({
    id: `demo-${i}`,
    name: fallbackNames[i % fallbackNames.length],
    completed: false,
    rewardPoint: fallbackPts[i % fallbackPts.length],
    tag: fallbackTags[i % fallbackTags.length],
  }));
});
</script>

<template>
  <section class="w-full">
    <!-- 플랫 헤더: 아이콘 큼 + 타이틀 옆 서브타이틀 -->
    <button class="flex w-full items-center gap-3 py-4" @click="emit('toggle')">
      <CategoryIconBox :icon-src="iconSrc" :alt-text="title" />

      <div class="flex min-w-0 flex-1 flex-col items-start">
        <span class="text-body text-gray-50">{{ title }}</span>
        <span class="text-body3 text-gray-50">{{ subtitle }}</span>
      </div>

      <img
        src="@/assets/images/Chevron_Down_XL.svg"
        alt="펼치기"
        class="h-5 w-5 transition-transform"
        :class="{ 'rotate-180': isExpanded }"
      />
    </button>

    <!-- 잠금 -->
    <div v-if="isLocked && isExpanded" class="px-1 pb-3">
      <div
        class="flex items-center justify-center gap-2 rounded-xl border border-gray-800 px-4 py-4"
      >
        <img
          :src="LockIcon"
          alt="locked"
          class="h-4 w-4 object-contain brightness-200 contrast-150 filter"
        />
        <span class="text-body3 text-gray-500">{{ lockMessage }}</span>
      </div>
    </div>

    <!-- 리스트 -->
    <div v-show="isExpanded && !isLocked" class="space-y-3 px-1 pb-4">
      <div
        v-for="q in displayQuests"
        :key="q.id"
        class="group flex min-h-[48px] items-center justify-between rounded-xl px-3 py-3.5 transition-colors hover:bg-white/5"
        @click="$emit('routine-click', q)"
      >
        <!-- 왼쪽: 이름 옆 태그(같은 줄) -->
        <div class="flex min-w-0 items-center gap-2">
          <p class="truncate text-body2 font-bold text-white">{{ q.name }}</p>
          <span
            class="inline-flex items-center whitespace-nowrap rounded-full border border-gray-600 bg-gray-600 px-2 py-[2px] text-button leading-none text-white"
          >
            {{ q.tag }}
          </span>
        </div>

        <!-- 오른쪽: 미완료면 +점수, 완료면 체크 -->
        <div class="ml-3 flex items-center gap-2">
          <span
            v-if="!q.completed"
            class="rounded-full bg-primary/10 px-2 py-0.5 text-button font-medium text-primary"
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
