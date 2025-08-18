<script setup>
import { ref, computed, nextTick } from "vue";
import { postQnAAnswer } from "@/composables/api/useQnAAnswer";
import editIcon from "@/assets/images/trainer/mypage/edit.png";

const props = defineProps({
  items: { type: Array, default: () => [] },
  initialTab: { type: String, default: "completed" },
  accordion: { type: Boolean, default: false },
  isTrainer: { type: Boolean, default: false },
  trainingId: { type: [Number, String], required: true },
});

const emit = defineEmits([
  "tab-change",
  "open",
  "close",
  "toggle",
  "answered",
  "answer-error",
]);

const selectedTab = ref(props.initialTab);
const openIds = ref(new Set());
// textarea ref들 저장
const textareaRefs = ref({});

// 아이콘 클릭 시 동작
const tryPencilSubmit = async (it) => {
  if (!props.isTrainer || selectedTab.value !== "pending" || it.hasAnswer)
    return;

  const text = (answers.value[it.id] || "").trim();

  // 내용이 없으면 펼치고 포커스만
  if (!text) {
    if (!isOpen(it.id)) toggle(it.id);
    await nextTick();
    textareaRefs.value[it.id]?.focus();
    return;
  }

  // 내용이 있으면 바로 등록
  if (!isSubmitting(it.id)) {
    submitAnswer(it);
  }
};

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

// 트레이너 답변 폼 상태
const answers = ref({});
const submitting = ref(new Set());
const isSubmitting = (id) => submitting.value.has(id);

const cancelAnswer = (id) => {
  answers.value[id] = "";
};

const submitAnswer = async (it) => {
  const text = (answers.value[it.id] || "").trim();
  if (!props.isTrainer || selectedTab.value !== "pending" || !text) return;
  if (!props.trainingId) {
    alert("trainingId가 없습니다.");
    return;
  }

  submitting.value.add(it.id);
  try {
    await postQnAAnswer(props.trainingId, it.id, text);
    // 로컬 UI 즉시 반영
    it.hasAnswer = true;
    it.answer = text;
    it.answerDate = new Date().toISOString().slice(0, 16).replace("T", " ");
    answers.value[it.id] = "";
    emit("answered", { id: it.id, answer: text });
  } catch (e) {
    console.error(e);
    emit("answer-error", { id: it.id, error: e });
    alert("답변 등록에 실패했습니다.");
  } finally {
    submitting.value.delete(it.id);
  }
};
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
              <div class="relative w-full rounded-xl bg-[#2C2C2C] p-4">
                <p
                  class="mb-4 whitespace-pre-wrap break-words break-all text-body2 leading-relaxed"
                >
                  {{ it.content }}
                </p>
                <div class="border-t border-gray-600 pt-3">
                  <div class="flex items-center justify-between">
                    <span class="text-body2 font-bold">{{ it.userName }}</span>
                    <span class="text-body2">{{ it.questionDate }}</span>
                  </div>
                </div>
              </div>

              <!-- 트레이너 전용: 미완료 탭에서 미답변 항목이면 답변 입력 폼 노출 -->
              <div
                v-if="isTrainer && selectedTab === 'pending' && !it.hasAnswer"
                class="w-full rounded-xl bg-[#2C2C2C] p-4"
              >
                <textarea
                  v-model="answers[it.id]"
                  @keydown.enter.ctrl.prevent="submitAnswer(it)"
                  class="w-full resize-none overflow-y-auto border-none bg-transparent text-sm leading-relaxed text-white placeholder-gray-500 outline-none"
                  style="
                    min-height: 10px;
                    max-height: 300px;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  "
                />
                <div class="mt-3 flex items-center justify-between">
                  <span class="text-sm text-gray-400">
                    {{ (answers[it.id] || "").length }}자
                  </span>
                  <div class="flex gap-2">
                    <button
                      class="rounded-lg bg-gray-600 px-4 py-2 text-body2"
                      type="button"
                      :disabled="isSubmitting(it.id)"
                      @click="cancelAnswer(it.id)"
                    >
                      취소
                    </button>
                    <button
                      class="rounded-lg bg-primary px-4 py-2 text-body2 text-black disabled:opacity-50"
                      type="button"
                      :disabled="
                        isSubmitting(it.id) ||
                        !(answers[it.id] || '').trim().length
                      "
                      @click="submitAnswer(it)"
                    >
                      {{ isSubmitting(it.id) ? "등록 중..." : "답변 등록" }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- 답변 표시 -->
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
textarea::-webkit-scrollbar,
div::-webkit-scrollbar {
  display: none;
}
</style>
