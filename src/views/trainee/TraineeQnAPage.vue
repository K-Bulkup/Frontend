<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getTrainingQnAListDetail } from "@/composables/api/useQnAListApi";

const router = useRouter();
const route = useRoute();

const trainingId = ref(route.params.trainingId);
const courseTitle = ref("투자 흐름 근력 키우기 - 기초부터 마스터하기");
const courseInfo = ref({
  studentCount: "1,247",
  rating: "4.8",
  level: "초급",
  category: "투자 설계",
  reward: "총 리워드 20P",
  image:
    "https://api.builder.io/api/v1/image/assets/TEMP/d2a896aee4f20bd20fdad842126d01d2b4a1fec5?width=216",
});

const qnaData = ref([]);
const selectedTab = ref("completed"); // 'pending' | 'completed'

const filteredQnaData = computed(() =>
  qnaData.value.filter((item) =>
    selectedTab.value === "completed" ? item.hasAnswer : !item.hasAnswer,
  ),
);

const getQnAList = async () => {
  try {
    const res = await getTrainingQnAListDetail(trainingId.value);
    const rawList = res.data.data.trainingQnADetails;
    courseTitle.value = res.data.data.trainingTitle;

    qnaData.value = rawList.map((qna) => {
      const fmt = (arr) => {
        if (!arr || arr.length < 3) return "";
        const [yyyy, mm, dd, hh = 0, mi = 0] = arr;
        return `${yyyy}.${String(mm).padStart(2, "0")}.${String(dd).padStart(
          2,
          "0",
        )} ${String(hh).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
      };
      return {
        id: qna.qnaId,
        title: qna.questionTitle || "제목 없음",
        content: qna.question,
        answer: qna.answer,
        hasAnswer: !!qna.answer,
        isExpanded: false,
        questionDate: fmt(qna.createAt),
        answerDate: fmt(qna.answeredAt),
      };
    });
  } catch (e) {
    console.error("❌ Q&A 리스트 조회 실패:", e);
  }
};

const handleBack = () => router.back();
const switchTab = (tab) => (selectedTab.value = tab);

// id 기준으로 토글 (현재 배열 원본 유지)
const toggleExpand = (id) => {
  const it = qnaData.value.find((q) => q.id === id);
  if (it) it.isExpanded = !it.isExpanded;
};

const handleCreateQuestion = () => {
  router.push({
    path: `/trainee/mypage/training/${trainingId.value}/question`,
    query: { courseTitle: courseTitle.value },
  });
};

onMounted(getQnAList);
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-white">
    <!-- Header -->
    <div class="relative flex items-center justify-center px-4 py-6">
      <button
        @click="handleBack"
        class="absolute left-4 flex h-6 w-6 items-center justify-center"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 19L8 12L15 5"
            stroke="#22E481"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h1 class="text-subTitle font-semibold">Q & A</h1>
    </div>

    <!-- Course Info -->
    <div class="flex items-start gap-4 px-6 pb-6">
      <img
        :src="courseInfo.image"
        alt="Course thumbnail"
        class="w-27 h-40 flex-shrink-0 rounded-xl object-cover"
      />
      <div class="flex-1">
        <h2 class="mb-3 text-subTitle font-bold leading-tight">
          {{ courseTitle }}
        </h2>

        <div class="mb-3 flex items-center gap-4">
          <div class="flex items-center gap-1">
            <span class="text-body2 text-gray-300">수강생</span>
            <span class="text-body2 font-semibold text-gray-300">{{
              courseInfo.studentCount
            }}</span>
          </div>
          <div class="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M7.23977 2.34142C7.47977 1.60462 8.52217 1.60462 8.76137 2.34142L9.61737 4.97502C9.66966 5.13541 9.77133 5.27516 9.90781 5.3743C10.0443 5.47344 10.2087 5.5269 10.3774 5.52702H13.147C13.9222 5.52702 14.2438 6.51902 13.6174 6.97502L11.3774 8.60222C11.2406 8.70144 11.1388 8.84143 11.0864 9.0021C11.0341 9.16278 11.034 9.33589 11.0862 9.49662L11.9422 12.1302C12.1822 12.867 11.3382 13.4806 10.7102 13.0246L8.47017 11.3974C8.33353 11.2982 8.16901 11.2448 8.00017 11.2448C7.83132 11.2448 7.6668 11.2982 7.53017 11.3974L5.29017 13.0246C4.66297 13.4806 3.81976 12.867 4.05896 12.1302L4.91497 9.49662C4.96711 9.33589 4.96701 9.16278 4.9147 9.0021C4.86239 8.84143 4.76054 8.70144 4.62377 8.60222L2.38457 6.97582C1.75817 6.51982 2.08057 5.52782 2.85497 5.52782H5.62377C5.79261 5.52786 5.95713 5.47449 6.09379 5.37534C6.23044 5.27619 6.33223 5.13634 6.38457 4.97582L7.24057 2.34222L7.23977 2.34142Z"
                fill="#FFC700"
              />
            </svg>
            <span class="text-body2 font-semibold text-gray-300">{{
              courseInfo.rating
            }}</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1">
          <span class="rounded-pill bg-green-600 px-2 py-1 text-button">
            {{ courseInfo.level }}
          </span>
          <span class="rounded-pill bg-gray-600 px-2 py-1 text-button">
            {{ courseInfo.category }}
          </span>
          <span class="rounded-pill bg-gray-600 px-2 py-1 text-button">
            {{ courseInfo.reward }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="px-6 pb-6">
      <div class="border-b border-gray-600" />
      <div class="mt-5 flex gap-3">
        <button
          @click="switchTab('pending')"
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
          @click="switchTab('completed')"
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
    </div>

    <!-- Q&A List -->
    <div class="flex-1 px-6 pb-24">
      <template v-if="filteredQnaData.length">
        <div v-for="item in filteredQnaData" :key="item.id" class="mb-4">
          <!-- 바깥 카드: 펼쳤을 때만 배경과 패딩이 생김 -->
          <div
            :class="[
              'w-full rounded-2xl',
              item.isExpanded ? 'bg-gray-custom p-3' : '',
            ]"
          >
            <!-- 제목 헤더 -->
            <button
              @click="toggleExpand(item.id)"
              :aria-expanded="item.isExpanded"
              :class="[
                'flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left',
                item.isExpanded ? 'bg-transparent' : 'bg-gray-custom',
              ]"
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
                  {{ item.title }}
                </p>
              </div>

              <svg
                class="ml-3 h-6 w-6 flex-shrink-0 transition-transform"
                :class="{ '-rotate-90': item.isExpanded }"
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
              <div v-show="item.isExpanded" class="mt-3 space-y-3">
                <!-- 질문 내용 -->
                <div class="w-full rounded-xl bg-[#2C2C2C] p-4">
                  <p
                    class="mb-4 whitespace-pre-wrap break-words break-all text-body2 leading-relaxed"
                  >
                    {{ item.content }}
                  </p>
                  <div class="border-t border-gray-600 pt-3">
                    <div class="flex items-center justify-between">
                      <span class="text-body2 font-bold">
                        {{ item.id }}
                      </span>
                      <span class="text-body2"> {{ item.questionDate }} </span>
                    </div>
                  </div>
                </div>

                <!-- 답변 -->
                <div
                  v-if="item.hasAnswer && item.answer"
                  class="w-full rounded-xl bg-[#2C2C2C] p-4"
                >
                  <p
                    class="mb-4 whitespace-pre-wrap break-words break-all text-body2 leading-relaxed"
                  >
                    {{ item.answer }}
                  </p>
                  <div class="border-t border-gray-600 pt-3">
                    <div class="flex justify-end">
                      <span class="text-body2"> {{ item.answerDate }} </span>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </template>

      <!-- Empty -->
      <template v-else>
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="mb-4 h-12 w-12" viewBox="0 0 22 22" fill="none">
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

    <!-- FAB -->
    <div class="fixed bottom-20 right-6 z-50">
      <button
        @click="handleCreateQuestion"
        class="h-15 w-15 flex items-center justify-center rounded-full bg-gray-900 shadow-lg"
        style="filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25))"
      >
        <svg class="h-8 w-8 text-primary" viewBox="0 0 30 30" fill="none">
          <path
            d="M13.75 6.25H5.97222C5.38285 6.25 4.81762 6.48413 4.40087 6.90087C3.98413 7.31762 3.75 7.88285 3.75 8.47222V24.0278C3.75 24.6171 3.98413 25.1824 4.40087 25.5991C4.81762 26.0159 5.38285 26.25 5.97222 26.25H21.5278C22.1171 26.25 22.6824 26.0159 23.0991 25.5991C23.5159 25.1824 23.75 24.6171 23.75 24.0278V16.25"
            stroke="#22E481"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M22.0828 4.46498C22.5406 4.00719 23.1615 3.75 23.8089 3.75C24.4563 3.75 25.0772 4.00719 25.535 4.46498C25.9928 4.92277 26.25 5.54367 26.25 6.19109C26.25 6.83851 25.9928 7.45941 25.535 7.91721L14.603 18.8493L10 20L11.1507 15.397L22.0828 4.46498Z"
            stroke="#22E481"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- Bottom Nav placeholder -->
    <div class="h-20 border-t border-gray-700 bg-background">
      <div class="flex h-full items-center justify-center gap-8">
        <div class="flex flex-col items-center">
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
            <path
              d="M19.4352 9.5V18C19.4352 19.1046 18.5398 20 17.4352 20H7.1146C6.01003 20 5.1146 19.1046 5.1146 18V9.5M22.5039 12L12.2749 3L2.0459 12"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="text-body2">홈</span>
        </div>
        <div class="flex flex-col items-center">
          <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
            <path
              d="M17.9011 9.58333C17.904 10.6832 17.6412 11.7682 17.134 12.75C16.5325 13.9265 15.608 14.916 14.4637 15.6077C13.3195 16.2995 12.0009 16.6662 10.6556 16.6667C9.53048 16.6696 8.42065 16.4126 7.4164 15.9167L2.55762 17.5L4.17721 12.75C3.66996 11.7682 3.4071 10.6832 3.41003 9.58333C3.41055 8.26816 3.78562 6.97907 4.49322 5.86048C5.20082 4.7419 6.213 3.83797 7.4164 3.25002C8.42065 2.75413 9.53048 2.49716 10.6556 2.50002H11.0818C12.8585 2.59585 14.5366 3.32899 15.7949 4.55907C17.0531 5.78916 17.8031 7.42973 17.9011 9.16667V9.58333Z"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="text-body2">1:1 PT</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.h-15 {
  height: 3.75rem;
}
.w-15 {
  width: 3.75rem;
}
.w-27 {
  width: 6.75rem;
}

/* 펼침 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
