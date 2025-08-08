<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseTextarea from "@/components/common/BaseTextarea.vue";
import { getMyTrainings } from "@/composables/api/trainer/training/trainerTrainingAPI";
import { getTrainingQnAListDetail } from "@/composables/api/useQnAListApi";
import { postQnAAnswer } from "@/composables/api/useQnAAnswer";

const router = useRouter();

const trainings = ref([]);
const isOpen = ref(false);
const selectedId = ref(null); // 선택된 trainingId

// QnA 리스트 상태
const courseTitle = ref("");
const qnaData = ref([]);
const isLoadingQnA = ref(false);

// 드롭다운 바깥 클릭 닫기
const boxRef = ref(null);
const onDocClick = (e) => {
  if (boxRef.value && !boxRef.value.contains(e.target)) isOpen.value = false;
};

const fetchMyTrainings = async () => {
  try {
    const res = await getMyTrainings();
    trainings.value = res.data?.data ?? [];
    if (trainings.value.length && selectedId.value == null) {
      selectedId.value = trainings.value[0].trainingId; // 기본 선택
    }
  } catch (e) {
    console.error("트레이닝 목록 실패:", e);
  }
};

// 선택된 강좌 객체/제목
const selected = computed(() =>
  trainings.value.find((t) => t.trainingId === selectedId.value),
);
const selectedTitle = computed(
  () => selected.value?.title ?? "강좌를 선택하세요",
);

const toggle = () => (isOpen.value = !isOpen.value);
const choose = (id) => {
  selectedId.value = id; // watch로 QnA 로드
  isOpen.value = false;
};

// QnA 조회
const getQnAList = async (trainingId) => {
  if (!trainingId) return;
  isLoadingQnA.value = true;
  try {
    const res = await getTrainingQnAListDetail(trainingId);
    const data = res.data?.data;
    const rawList = data?.trainingQnADetails ?? [];
    courseTitle.value = data?.trainingTitle ?? "";

    const formatDate = (arr) => {
      if (!arr || arr.length < 3) return "";
      const [yyyy, mm, dd, hh = 0, mi = 0] = arr;
      return `${yyyy}.${String(mm).padStart(2, "0")}.${String(dd).padStart(2, "0")} ${String(hh).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
    };

    qnaData.value = rawList.map((qna) => ({
      id: qna.qnaId,
      title: qna.questionTitle || "제목 없음",
      content: qna.question,
      answer: qna.answer,
      hasAnswer: !!qna.answer,
      isExpanded: false,
      author: `작성자 #${qna.userId}`,
      questionDate: formatDate(qna.createAt),
      answerDate: formatDate(qna.answeredAt),
      draftAnswer: "", // BaseTextarea v-model 대상
    }));
  } catch (error) {
    console.error("❌ Q&A 리스트 조회 실패:", error);
    qnaData.value = [];
  } finally {
    isLoadingQnA.value = false;
  }
};

// 항목 토글
const toggleExpand = (index) => {
  qnaData.value[index].isExpanded = !qnaData.value[index].isExpanded;
};

// 답변 등록
const submittingIndex = ref(null);
const submitAnswer = async (index) => {
  const item = qnaData.value[index];
  const answer = (item.draftAnswer || "").trim();
  if (!answer) return;

  submittingIndex.value = index;
  try {
    await postQnAAnswer(selectedId.value, item.id, answer);
    await getQnAList(selectedId.value); // 갱신
  } catch (e) {
    console.error("❌ 답변 등록 실패:", e);
  } finally {
    submittingIndex.value = null;
  }
};

const handleBack = () => router.back();

// 선택된 강좌가 바뀔 때마다 QnA 재로드
watch(selectedId, (id) => {
  getQnAList(id);
});

onMounted(() => {
  fetchMyTrainings();
  document.addEventListener("click", onDocClick);
});

onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack text-white">
    <!-- Header -->
    <div class="px-4 pt-4">
      <BaseHeader title="Q & A" @back="handleBack" />
    </div>

    <!-- 선택 박스 -->
    <div class="mx-4 mb-6" ref="boxRef">
      <button
        type="button"
        @click="toggle"
        class="flex w-full items-center justify-between rounded-xl border border-white bg-realBlack px-5 py-4"
      >
        <div class="flex min-w-0 items-center gap-3">
          <img
            v-if="selected"
            :src="selected.thumbnailUrl"
            alt="썸네일"
            class="h-7 w-7 shrink-0 rounded object-cover"
          />
          <h1 class="truncate text-heading font-semibold text-white">
            {{ selected ? selected.title : "강좌를 선택하세요" }}
          </h1>
        </div>

        <svg
          class="h-5 w-5 text-white transition-transform"
          :class="{ 'rotate-180': isOpen }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
          />
        </svg>
      </button>

      <div
        v-if="isOpen"
        class="mt-2 w-full overflow-hidden rounded-xl border border-white/20 bg-neutral-900"
      >
        <ul class="max-h-64 overflow-auto py-2">
          <li
            v-for="t in trainings"
            :key="t.trainingId"
            @click="choose(t.trainingId)"
            class="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-neutral-800"
          >
            <img
              :src="t.thumbnailUrl"
              alt=""
              class="h-8 w-8 rounded object-cover"
            />
            <div class="min-w-0">
              <p class="truncate font-medium text-white">{{ t.title }}</p>
              <p class="truncate text-xs text-gray-300">
                {{ t.category }} · {{ t.level }} · ⭐ {{ t.averageRating }}
              </p>
            </div>
            <span
              v-if="selectedId === t.trainingId"
              class="ml-auto text-sm text-primary"
              >선택됨</span
            >
          </li>
        </ul>
      </div>
    </div>

    <!-- Q&A List -->
    <div class="flex-1 space-y-4 px-4 pb-20">
      <div
        v-for="(item, index) in qnaData"
        :key="item.id"
        class="rounded-xl bg-gray-100"
      >
        <!-- Question Header -->
        <div
          class="flex cursor-pointer items-center justify-between p-4"
          @click="toggleExpand(index)"
        >
          <div class="flex items-center space-x-3">
            <div class="flex h-5 w-5 items-center justify-center">
              <svg
                class="h-5 w-5"
                :class="item.hasAnswer ? 'text-green-500' : 'text-gray-300'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 20 20"
              >
                <circle cx="10" cy="10" r="7.5" stroke-width="2" />
                <circle
                  :fill="item.hasAnswer ? '#28A745' : '#D0D0D0'"
                  cx="10"
                  cy="13.33"
                  r="1.25"
                />
                <path
                  d="M8.821 6.762c.325-.325.751-.487 1.176-.488.428-.001.855.162 1.181.488.326.325.489.752.489 1.179 0 .426-.163.853-.489 1.178-.326.326-.753.489-1.181.488L10 10.44"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <h3 class="flex-1 text-heading text-black">{{ item.title }}</h3>
          </div>

          <svg
            class="h-5 w-5 text-black transition-transform"
            :class="{ 'rotate-180': item.isExpanded }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 8 5"
          >
            <path
              d="M7 1L4 4L1 1"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <!-- Expanded Content -->
        <div v-if="item.isExpanded && item.content" class="px-4 pb-4">
          <!-- Question Content -->
          <div class="mb-4 rounded-lg bg-white p-4">
            <p class="mb-4 text-subtext leading-relaxed text-black">
              {{ item.content }}
            </p>
            <div class="border-t border-gray-200 pt-2">
              <div class="flex items-center justify-between">
                <span class="text-extra text-gray-800">{{ item.author }}</span>
                <span class="text-extra text-gray-700">{{
                  item.questionDate
                }}</span>
              </div>
            </div>
          </div>

          <!-- Answer Content OR Answer Form -->
          <div
            v-if="item.hasAnswer && item.answer"
            class="rounded-lg bg-white p-4"
          >
            <p class="mb-4 text-subtext leading-relaxed text-black">
              {{ item.answer }}
            </p>
            <div class="border-t border-gray-200 pt-2">
              <div class="flex justify-end">
                <span class="text-extra text-gray-700">{{
                  item.answerDate
                }}</span>
              </div>
            </div>
          </div>

          <!-- 미답변: BaseTextarea 사용 -->
          <div v-else class="rounded-lg bg-white p-4">
            <BaseTextarea
              v-model="item.draftAnswer"
              label="답변을 입력하세요"
              description=""
              :maxlength="500"
              :minlength="10"
              :rows="5"
            />
            <div class="mt-2 flex justify-end gap-2">
              <button
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-black hover:bg-gray-200"
                @click="item.draftAnswer = ''"
              >
                취소
              </button>
              <button
                class="rounded-lg border border-gray-100 bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
                :disabled="
                  submittingIndex === index ||
                  !(item.draftAnswer && item.draftAnswer.trim().length >= 5)
                "
                @click="submitAnswer(index)"
              >
                {{ submittingIndex === index ? "등록 중…" : "답변 등록" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isLoadingQnA" class="px-4 text-gray-300">불러오는 중…</div>
      <div
        v-else-if="!isLoadingQnA && !qnaData.length"
        class="px-4 text-gray-300"
      >
        Q&A가 없습니다.
      </div>
    </div>
  </div>
</template>
