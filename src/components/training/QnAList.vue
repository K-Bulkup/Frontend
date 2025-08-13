<script setup>
import { ref, computed } from "vue";

/** 공통 Q&A 리스트 컴포넌트
 * props:
 *  - items: [{ id, title, content, answer, hasAnswer, questionDate, answerDate, ... }]
 *  - initialTab: 'completed' | 'pending' (기본: 'completed')
 *  - accordion: true면 한 번에 하나만 펼침
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  initialTab: { type: String, default: "completed" },
  accordion: { type: Boolean, default: false },
});
const emit = defineEmits(["tab-change", "open", "close", "toggle"]);

const selectedTab = ref(props.initialTab);
const openIds = ref(new Set());

const isOpen = (id) => openIds.value.has(id);
const toggle = (id) => {
  const next = !isOpen(id);
  if (props.accordion) {
    openIds.value = new Set(next ? [id] : []);
  } else {
    const s = new Set(openIds.value);
    next ? s.add(id) : s.delete(id);
    openIds.value = s;
  }
  emit("toggle", { id, open: next });
  emit(next ? "open" : "close", id);
};

const filtered = computed(() =>
  (props.items ?? []).filter((it) =>
    selectedTab.value === "completed" ? !!it.hasAnswer : !it.hasAnswer,
  ),
);
</script>

<template>
  <div>
    <!-- 필터 -->
    <div class="mb-4 flex gap-3">
      <button
        @click="
          selectedTab = 'pending';
          $emit('tab-change', 'pending');
        "
        :class="[
          'rounded-pill border px-4 py-2 text-body2',
          selectedTab === 'pending'
            ? 'border-primary bg-primary/20'
            : 'border-gray-600 bg-gray-600',
        ]"
      >
        답변 미완료
      </button>
      <button
        @click="
          selectedTab = 'completed';
          $emit('tab-change', 'completed');
        "
        :class="[
          'rounded-pill border px-4 py-2 text-body2',
          selectedTab === 'completed'
            ? 'border-primary bg-primary/20'
            : 'border-gray-600 bg-gray-600',
        ]"
      >
        답변 완료
      </button>
    </div>

    <!-- 리스트 -->
    <div class="space-y-4">
      <template v-if="filtered.length">
        <div
          v-for="it in filtered"
          :key="it.id"
          :class="[
            'w-full rounded-2xl',
            isOpen(it.id) ? 'bg-gray-custom p-3' : '',
          ]"
        >
          <!-- 제목 헤더 -->
          <button
            :aria-expanded="isOpen(it.id)"
            @click="toggle(it.id)"
            class="flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left"
            :class="isOpen(it.id) ? 'bg-transparent' : 'bg-gray-custom'"
          >
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <svg
                class="h-6 w-6 flex-shrink-0 self-center"
                viewBox="0 0 22 22"
                fill="none"
              >
                <path
                  d="M11 19.25C15.5563 19.25 19.25 15.5563 19.25 11C19.25 6.44365 15.5563 2.75 11 2.75C6.44365 2.75 2.75 6.44365 2.75 11C2.75 15.5563 6.44365 19.25 11 19.25Z"
                  stroke="#22E481"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12.375 14.6665C12.375 15.4259 11.7594 16.0415 11 16.0415C10.2406 16.0415 9.625 15.4259 9.625 14.6665C9.625 13.9071 10.2406 13.2915 11 13.2915C11.7594 13.2915 12.375 13.9071 12.375 14.6665Z"
                  fill="#22E481"
                />
                <path
                  d="M9.70364 7.43796C10.0608 7.08081 10.5287 6.90182 10.9968 6.901C11.467 6.90017 11.9376 7.07916 12.2964 7.43796C12.6543 7.79595 12.8333 8.26514 12.8333 8.73433C12.8333 9.20352 12.6543 9.67271 12.2964 10.0307C11.9376 10.3895 11.467 10.5685 10.9968 10.5677L11 11.4843"
                  stroke="#22E481"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p
                class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-body2 leading-tight text-gray-50"
              >
                {{ it.title }}
              </p>
            </div>

            <!-- 접힘: ←  / 펼침: ↓  (왼쪽 아이콘을 -90deg 회전) -->
            <svg
              class="ml-3 h-6 w-6 flex-shrink-0 transition-transform"
              :class="isOpen(it.id) ? '-rotate-90' : 'rotate-0'"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M15 19L8 12L15 5"
                stroke="#22E481"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- 펼침 내용 -->
          <transition name="fade">
            <div v-show="isOpen(it.id)" class="mt-3 space-y-3">
              <!-- 질문 -->
              <div class="w-full rounded-xl bg-[#2C2C2C] p-4">
                <p
                  class="mb-4 whitespace-pre-wrap break-words break-all text-body2 leading-relaxed"
                >
                  {{ it.content }}
                </p>
                <div class="border-t border-gray-600 pt-3">
                  <div class="flex items-center justify-between">
                    <span class="text-body2 font-bold">{{
                      it.author ?? "작성자"
                    }}</span>
                    <span class="text-body2">{{ it.questionDate }}</span>
                  </div>
                </div>
              </div>

              <!-- 답변 -->
              <div
                v-if="it.hasAnswer && it.answer"
                class="w-full rounded-xl bg-[#2C2C2C] p-4"
              >
                <p
                  class="mb-4 whitespace-pre-wrap break-words break-all text-body2 leading-relaxed"
                >
                  {{ it.answer }}
                </p>
                <div class="border-t border-gray-600 pt-3">
                  <div class="flex justify-end">
                    <span class="text-body2">{{ it.answerDate }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-col items-center justify-center py-12">
          <p class="text-body text-gray-300">
            {{
              selectedTab === "completed"
                ? "답변 완료된 질문이 없습니다."
                : "답변 대기 중인 질문이 없습니다."
            }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
