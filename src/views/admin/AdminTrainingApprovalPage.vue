<script setup>
import { ref, onMounted } from "vue";
import apiClient from "@/plugins/axios";

const pendingTrainings = ref([]);

// 페이지가 로드될 때 승인 대기 목록을 가져옵니다.
onMounted(async () => {
  try {
    const response = await apiClient.get("/api/admin/trainings/pending");
    console.log("강좌 승인 API 응답:", response);
    // 백엔드 응답이 { data: [...] } 형태일 경우 response.data.data 사용
    // 그렇지 않고 바로 배열일 경우 response.data 사용
    pendingTrainings.value = response.data.data || response.data;
  } catch (error) {
    console.error("승인 대기 강좌 목록 조회 실패:", error.response || error);
    alert(
      "데이터를 불러오는 데 실패했습니다. (API가 아직 준비되지 않았을 수 있습니다)",
    );
  }
});

const approveTraining = async (trainingId) => {
  try {
    await apiClient.post(`/api/admin/trainings/${trainingId}/approve`);
    alert("강좌가 승인되었습니다.");
    // 목록에서 승인된 항목 제거
    pendingTrainings.value = pendingTrainings.value.filter(
      (t) => t.trainingId !== trainingId,
    );
  } catch (error) {
    console.error("강좌 승인 실패:", error);
    alert("강좌 승인에 실패했습니다. (API가 아직 준비되지 않았을 수 있습니다)");
  }
};

const rejectTraining = async (trainingId) => {
  try {
    await apiClient.post(`/api/admin/trainings/${trainingId}/reject`);
    alert("강좌가 거절되었습니다.");
    // 목록에서 거절된 항목 제거
    pendingTrainings.value = pendingTrainings.value.filter(
      (t) => t.trainingId !== trainingId,
    );
  } catch (error) {
    console.error("강좌 거절 실패:", error);
    alert("강좌 거절에 실패했습니다. (API가 아직 준비되지 않았을 수 있습니다)");
  }
};
</script>

<template>
  <div class="bg-realblack min-h-screen p-6 text-white">
    <h1 class="mb-6 text-3xl font-bold">강좌 승인 관리</h1>

    <div class="mx-auto max-w-6xl rounded-xl bg-gray-800 p-4 shadow">
      <div class="overflow-x-auto rounded-lg">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-900 text-white">
            <tr>
              <th class="px-4 py-3 text-left font-semibold">강좌명</th>
              <th class="px-4 py-3 text-left font-semibold">트레이너</th>
              <th class="px-4 py-3 text-center font-semibold">수강생 수</th>
              <th class="px-4 py-3 text-center font-semibold">신청일</th>
              <th class="px-4 py-3 text-center font-semibold">관리</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="pendingTrainings.length === 0">
              <td colspan="5" class="px-4 py-6 text-center text-gray-800">
                승인 대기 중인 강좌가 없습니다.
              </td>
            </tr>
            <tr
              v-for="training in pendingTrainings"
              :key="training.trainingId"
              class="transition"
            >
              <td class="whitespace-nowrap px-4 py-3">
                {{ training.trainingName }}
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                {{ training.trainerName }}
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-center">
                {{ training.totalStudents }}명
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-center">
                {{ training.requestDate }}
              </td>
              <td class="space-x-2 px-4 py-3 text-center">
                <button
                  @click="approveTraining(training.trainingId)"
                  class="rounded-md bg-green-600 px-3 py-1 text-sm font-bold text-white hover:bg-green-700"
                >
                  승인
                </button>
                <button
                  @click="rejectTraining(training.trainingId)"
                  class="rounded-md bg-red-600 px-3 py-1 text-sm font-bold text-white hover:bg-red-700"
                >
                  거절
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
