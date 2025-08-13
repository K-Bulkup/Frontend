<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import BaseHeader from "@/components/common/BaseHeader.vue";
import { getTrainerReservation } from "@/composables/api/usePtApi";
import ScheduleListItem from "@/components/chat/ScheduleListItem.vue";

const router = useRouter();
const schedules = ref([]);
const loading = ref(false);

const fetchReservations = async () => {
  loading.value = true;
  try {
    const { data } = await getTrainerReservation();
    if (data?.success) {
      schedules.value = (data.data || []).map((reservation) => {
        const [y, m, d, hh, mm] = reservation.startTime;
        const startDateTime = new Date(y, m - 1, d, hh, mm);
        return {
          id: reservation.reservationId,
          name: reservation.traineeName,
          category: reservation.trainingTitle,
          datetime: dayjs(startDateTime).format("YY.MM.DD HH:mm") + " 예약",
          status: reservation.status,
          reservationId: reservation.reservationId,
          profileUrl: reservation.traineeProfileUrl || "",
        };
      });
    }
  } catch (e) {
    console.error("예약 조회 실패:", e);
    alert("예약 목록을 불러오는데 실패했습니다.");
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.back();

const cancelSchedule = async (schedule) => {
  if (!confirm("정말로 이 예약을 취소하시겠습니까?")) return;
};

onMounted(fetchReservations);
</script>

<template>
  <div class="flex min-h-screen flex-col px-2 pb-24 pt-4">
    <BaseHeader title="1:1 PT" />

    <div class="flex-1 overflow-y-auto">
      <ScheduleListItem
        v-for="item in schedules"
        :key="item.id"
        :schedule-data="item"
        :name="item.name"
        :category="item.category"
        :datetime="item.datetime"
        :profile-url="item.profileUrl"
        @cancel="cancelSchedule"
      />
    </div>

    <div
      class="fixed bottom-0 left-0 right-0 border-t border-gray-700 bg-background px-4 py-4"
    >
      <div class="flex items-center justify-center space-x-16">
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
          <span class="mt-1 text-[12px] text-white">홈</span>
        </div>
        <div class="flex flex-col items-center">
          <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
            <path
              d="M17.9006 9.58333C17.9035 10.6832 17.6407 11.7682 17.1335 12.75C16.532 13.9265 15.6075 14.916 14.4632 15.6077C13.319 16.2995 12.0004 16.6662 10.6551 16.6667C9.52999 16.6696 8.42016 16.4126 7.41591 15.9167L2.55713 17.5L4.17672 12.75C3.66947 11.7682 3.40661 10.6832 3.40955 9.58333C3.41007 8.26816 3.78513 6.97907 4.49273 5.86048C5.20033 4.7419 6.21251 3.83797 7.41591 3.25002C8.42016 2.75413 9.52999 2.49716 10.6551 2.50002H11.0813C12.858 2.59585 14.5362 3.32899 15.7944 4.55907C17.0527 5.78916 17.8026 7.42973 17.9006 9.16667V9.58333Z"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="mt-1 text-[12px] text-white">1:1 PT</span>
        </div>
      </div>
    </div>
  </div>
</template>
