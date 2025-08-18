<script setup>
import { reactive, ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import starIcon from "@/assets/images/star.svg";
import profileDefault from "@/assets/images/mascot/profile.png";

import { traineeTrainerApi } from "@/composables/api/trainee/trainer/traineeTrainerApi";
import { getTraineeTrainingPreDetail } from "@/composables/api/trainee/training/traineeTrainingPreDetailAPI";
import badgeIcon from "@/assets/images/trainer/mypage/badge.png"; // 배지 아이콘 import

const route = useRoute();
const router = useRouter();

const showTooltip = ref(false); // 툴팁 표시 상태

// 자격증이 있는지 확인하는 computed
const hasCertificates = computed(() => {
  return trainerData.certificates && trainerData.certificates.length > 0;
});

// 툴팁에 표시할 자격증 목록
const certificateList = computed(() => {
  return trainerData.certificates.join(", ");
});

// 툴팁 표시/숨기기 함수들
const showCertificateTooltip = () => {
  showTooltip.value = true;
};

const hideCertificateTooltip = () => {
  showTooltip.value = false;
};

const trainerData = reactive({
  username: "트레이너",
  userProfileUrl: profileDefault,
  career: "",
  certificates: [],
  totalTraineeCount: 0,
  totalAverageRating: 0.0,
});

const trainingList = ref([]);
const n = (v) => (v == null ? 0 : Number(v));

const fetchTrainerDetail = async () => {
  try {
    const trainerId = route.params.trainerId;
    const r = await traineeTrainerApi.getTrainerInfo(trainerId);

    // 통합 응답(payload) 파싱
    const payload = r?.data?.data ?? {};
    const t = payload.profile ?? payload.trainer ?? {};
    const trainings = payload.trainings ?? [];

    // 키 불일치 모두 대응 (name/username, profileUrl/userProfileUrl 등)
    trainerData.username =
      t.name ?? t.username ?? trainerData.username ?? "트레이너";
    trainerData.userProfileUrl =
      t.profileUrl ?? t.userProfileUrl ?? profileDefault;
    trainerData.career = t.description ?? t.career ?? "";
    trainerData.totalTraineeCount = n(
      t.traineeCount ?? t.totalTraineeCount ?? 0,
    );
    trainerData.totalAverageRating = n(
      t.averageRating ?? t.totalAverageRating ?? 0,
    );
    trainerData.certificates = Array.isArray(t.certificates)
      ? t.certificates
      : Array.isArray(payload.certificates)
        ? payload.certificates
        : [];

    // 트레이닝 목록
    trainingList.value = trainings.map((x) => ({
      id: x.trainingId ?? x.id,
      title: x.title,
      price: n(x.price ?? 0),
      rating: n(x.averageRating ?? 0),
      level: x.level ?? "초급",
      thumbnailUrl: x.thumbnailUrl,
    }));
  } catch (e) {
    console.error("트레이너 정보 전체 조회 실패:", e);
  }
};

const handleBack = () => router.back();

const goToTrainingDetail = async (id) => {
  try {
    const r = await getTraineeTrainingPreDetail(id);
    const d = r?.data?.data ?? {};
    if (d.progress !== undefined) router.push(`/trainee/mypage/training/${id}`);
    else router.push(`/training/${id}`);
  } catch (e) {
    console.error("상세 정보 미리보기 실패:", e);
  }
};

onMounted(fetchTrainerDetail);
</script>

<template>
  <div class="min-h-screen pb-20 pt-8 text-white">
    <!-- 헤더: 뒤로가기 아이콘만 -->
    <header class="mb-6 px-5">
      <button
        type="button"
        @click="handleBack"
        aria-label="뒤로가기"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-primary hover:bg-gray-900/40"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 18l-6-6 6-6"
          />
        </svg>
      </button>
    </header>

    <!-- 상단 프로필 -->
    <section class="mb-12 px-5">
      <div class="flex flex-col items-center">
        <div class="relative mb-4">
          <div
            class="h-28 w-28 overflow-hidden rounded-full bg-gray-800 ring-2 ring-gray-800"
          >
            <img
              :src="trainerData.userProfileUrl"
              alt="프로필"
              class="h-full w-full object-cover"
            />
          </div>

          <!-- 인증 뱃지 (첫 번째 자격증 텍스트) -->
          <div class="flex items-center gap-2 text-center">
            <div
              v-if="hasCertificates"
              class="relative"
              @mouseenter="showCertificateTooltip"
              @mouseleave="hideCertificateTooltip"
            >
              <img
                :src="badgeIcon"
                alt="자격증"
                class="h-6 w-6 cursor-pointer"
              />

              <div
                v-if="showTooltip"
                class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform"
              >
                <div class="relative">
                  <div
                    class="min-w-[225px] whitespace-normal rounded-full border border-primary bg-primary bg-opacity-30 px-4 py-2 text-body text-white shadow-lg"
                  >
                    {{ certificateList }}
                  </div>
                  <div
                    class="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 border-b-4 border-l-4 border-r-4 border-transparent border-b-gray-900"
                  ></div>
                </div>
              </div>
            </div>
            <div class="text-title font-semibold text-white">
              {{ trainerData.username }}
            </div>
          </div>
        </div>

        <h1 class="mt-6 text-subTitle font-bold">{{ trainerData.username }}</h1>

        <div class="mb-8 mt-2 flex items-center gap-3 text-body2 text-gray-200">
          <span
            >수강생 {{ trainerData.totalTraineeCount.toLocaleString() }}명</span
          >
          <span class="opacity-60">|</span>
          <span class="flex items-center gap-1 text-body2">
            <img :src="starIcon" alt="별점" class="h-4 w-4" />
            {{ trainerData.totalAverageRating.toFixed(1) }}
          </span>
        </div>

        <div class="w-full">
          <div class="rounded-r15 bg-gray-custom px-5 py-5">
            <p
              v-if="trainerData.career?.trim()"
              class="whitespace-pre-wrap text-body2 leading-6 text-gray-50"
            >
              {{ trainerData.career }}
            </p>
            <p v-else class="text-center text-body2 text-gray-300">
              소개글을 작성해주세요!
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 운영 중인 트레이닝 -->
    <section class="mt-12 px-5">
      <h2 class="mb-5 text-input">운영 중인 트레이닝</h2>

      <div
        v-if="!trainingList.length"
        class="rounded-r15 bg-gray-800/60 px-4 py-10 text-center text-gray-300"
      >
        등록된 트레이닝이 없습니다.
      </div>

      <ul v-else class="flex flex-col gap-4">
        <li
          v-for="c in trainingList"
          :key="c.id"
          class="rounded-2xl border border-gray-900 bg-background px-4 py-4 shadow-sm"
        >
          <button
            type="button"
            class="flex w-full items-center gap-4 text-left"
            @click="goToTrainingDetail(c.id)"
          >
            <img
              :src="c.thumbnailUrl"
              alt=""
              class="h-14 w-14 flex-none rounded-xl object-cover ring-1 ring-gray-800"
            />

            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-start justify-between gap-2">
                <p class="line-clamp-1 text-input font-medium">{{ c.title }}</p>
                <div class="ml-2 flex items-center gap-1 whitespace-nowrap">
                  <img :src="starIcon" class="h-4 w-4" alt="별점" />
                  <span class="text-body2">{{
                    Number(c.rating || 0).toFixed(1)
                  }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-body2 text-gray-200"
                  >{{ c.price.toLocaleString() }}원</span
                >
                <span
                  class="rounded-full px-2 py-0.5 text-body3 text-white"
                  :class="{
                    'bg-[#008407]': (c.level || '초급') === '초급',
                    'bg-[#5141FF]': c.level === '중급',
                    'bg-[#FF4141]': c.level === '고급',
                  }"
                >
                  {{ c.level || "초급" }}
                </span>
              </div>
            </div>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>
