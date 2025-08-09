<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getTrainingQnAListDetail } from "@/composables/api/useQnAListApi";
import BaseHeader from "@/components/common/BaseHeader.vue";

const router = useRouter();
const route = useRoute();

const trainingId = ref(route.params.trainingId);
const courseTitle = ref("");
const qnaData = ref([]);

const getQnAList = async () => {
  try {
    const res = await getTrainingQnAListDetail(trainingId.value);
    console.log("✅ QnA 응답:", res.data.data);
    const rawList = res.data.data.trainingQnADetails;
    courseTitle.value = res.data.data.trainingTitle;

    qnaData.value = rawList.map((qna) => {
      const formatDate = (arr) => {
        if (!arr || arr.length < 3) return "";
        const [yyyy, mm, dd, hh = 0, mi = 0] = arr;
        return `${yyyy}.${String(mm).padStart(2, "0")}.${String(dd).padStart(2, "0")} ${String(hh).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
      };

      return {
        id: qna.qnaId,
        title: qna.questionTitle || "제목 없음",
        content: qna.question,
        answer: qna.answer,
        hasAnswer: !!qna.answer,
        isExpanded: false,
        author: `작성자 #${qna.userId}`,
        questionDate: formatDate(qna.createAt),
        answerDate: formatDate(qna.answeredAt),
      };
    });
  } catch (error) {
    console.error("❌ Q&A 리스트 조회 실패:", error);
  }
};

const handleBack = () => router.back();

const toggleExpand = (index) => {
  qnaData.value[index].isExpanded = !qnaData.value[index].isExpanded;
};

const handleCreateQuestion = () => {
  router.push({
    path: `/trainee/mypage/training/${trainingId.value}/question`,
    query: { courseTitle: courseTitle.value },
  });
};

onMounted(() => {
  getQnAList();
});
</script>

<template>
  <div class="flex min-h-screen flex-col bg-realBlack text-white">
    <!-- Header -->
    <div class="px-4 pt-4">
      <BaseHeader title="Q & A" @back="handleBack" />
    </div>

    <!-- Course Title Section -->
    <div class="mx-4 mb-6 rounded-xl border border-white bg-realBlack p-6">
      <h1 class="text-center text-heading font-semibold text-white">
        {{ courseTitle }}
      </h1>
    </div>

    <!-- Q&A List / Empty State -->
    <div class="flex-1 px-4 pb-20">
      <template v-if="qnaData.length > 0">
        <div
          v-for="(item, index) in qnaData"
          :key="item.id"
          class="mb-4 overflow-hidden rounded-xl bg-gray-100"
        >
          <!-- Question Header -->
          <div
            class="flex cursor-pointer items-center justify-between p-4"
            @click="toggleExpand(index)"
          >
            <div class="flex min-w-0 items-center space-x-3">
              <!-- Question Icon -->
              <div
                class="flex h-5 w-5 flex-shrink-0 items-center justify-center"
              >
                <svg
                  class="h-5 w-5"
                  :class="item.hasAnswer ? 'text-green-500' : 'text-gray-200'"
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
              <!-- Question Title (한 줄 말줄임) -->
              <h3
                class="min-w-0 flex-1 truncate break-words text-heading text-black"
              >
                {{ item.title }}
              </h3>
            </div>
            <!-- Chevron Icon -->
            <svg
              class="h-5 w-5 flex-shrink-0 text-black transition-transform"
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
              <!-- 본문 2줄 말줄임 -->
              <p
                class="multi-ellipsis-2 mb-4 line-clamp-2 break-words text-subtext leading-relaxed text-black"
              >
                {{ item.content }}
              </p>
              <div class="border-t border-gray-200 pt-2">
                <div class="flex items-center justify-between">
                  <span class="text-extra text-gray-800">
                    {{ item.author }}
                  </span>
                  <span class="text-extra text-gray-700">
                    {{ item.questionDate }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Answer Content -->
            <div
              v-if="item.hasAnswer && item.answer"
              class="rounded-lg bg-white p-4"
            >
              <!-- 답변 3줄 말줄임 -->
              <p
                class="multi-ellipsis-3 mb-4 line-clamp-3 break-words text-subtext leading-relaxed text-black"
              >
                {{ item.answer }}
              </p>
              <div class="border-t border-gray-200 pt-2">
                <div class="flex justify-end">
                  <span class="text-extra text-gray-700">
                    {{ item.answerDate }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 빈 상태 -->
      <template v-else>
        <p class="pt-2 text-heading text-white">Q&A가 없습니다.</p>
      </template>
    </div>

    <!-- Floating Action Button -->
    <div
      class="fixed bottom-[120px] z-50"
      style="right: max(1rem, calc(50vw - 180px))"
    >
      <button
        @click="handleCreateQuestion"
        class="h-15 w-15 flex items-center justify-center rounded-full bg-primary shadow-lg transition-opacity hover:opacity-80"
      >
        <svg
          class="h-7 w-7 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 30 30"
        >
          <path
            d="M13.75 6.25H5.97222C5.38285 6.25 4.81762 6.48413 4.40087 6.90087C3.98413 7.31762 3.75 7.88285 3.75 8.47222V24.0278C3.75 24.6171 3.98413 25.1824 4.40087 25.5991C4.81762 26.0159 5.38285 26.25 5.97222 26.25H21.5278C22.1171 26.25 22.6824 26.0159 23.0991 25.5991C23.5159 25.1824 23.75 24.6171 23.75 24.0278V16.25"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M22.0828 4.46498C22.5406 4.00719 23.1615 3.75 23.8089 3.75C24.4563 3.75 25.0772 4.00719 25.535 4.46498C25.9928 4.92277 26.25 5.54367 26.25 6.19109C26.25 6.83851 25.9928 7.45941 25.535 7.91721L14.603 18.8493L10 20L11.1507 15.397L22.0828 4.46498Z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* FAB custom size */
.h-15 {
  height: 3.75rem;
}
.w-15 {
  width: 3.75rem;
}

/* ====== 멀티라인 말줄임 fallback (Tailwind line-clamp 미사용 시) ====== */
/* 2줄 말줄임 */
.multi-ellipsis-2 {
  display: -webkit-box;
  display: box; /* 오래된 브라우저 지원용 */
  -webkit-line-clamp: 2;
  line-clamp: 2; /* 표준 속성 */
  -webkit-box-orient: vertical;
  box-orient: vertical; /* 오래된 브라우저 지원용 */
  overflow: hidden;
}

.multi-ellipsis-3 {
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
}
</style>
