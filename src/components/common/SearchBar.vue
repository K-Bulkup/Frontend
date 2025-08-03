<template>
  <div class="flex min-h-screen flex-col items-center bg-realBlack text-white">
    <!-- ✅ Floating SearchBar -->
    <div
      class="fixed left-0 right-0 top-0 z-50 flex justify-center bg-realBlack py-3 shadow-lg"
    >
      <input
        type="text"
        v-model="searchQuery"
        placeholder="트레이닝 검색..."
        class="w-[90%] max-w-[420px] rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-body text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- ✅ Training Cards: 2열 그리드 + gap -->
    <div
      class="grid w-full max-w-[460px] grid-cols-2 gap-4 overflow-y-auto px-4 pb-24 pt-24"
    >
      <div
        v-for="(training, index) in filteredTrainings"
        :key="index"
        class="rounded-md bg-gray-800 px-4 py-5 text-body shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(251,224,129,0.2)]"
      >
        {{ training.title }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const searchQuery = ref("");
const trainings = ref([
  { title: "근력 향상 4주 플랜" },
  { title: "유산소와 근력 병행" },
  { title: "고강도 근육 발달 프로그램" },
  { title: "체지방 감량 프로그램" },
  { title: "전신 스트레칭 루틴" },
  { title: "HIIT 15분 프로그램" },
  // ➕ 테스트용 데이터 추가 가능
]);

// ✅ 검색 필터
const filteredTrainings = computed(() => {
  if (!searchQuery.value) return trainings.value;
  return trainings.value.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// ✅ 무한스크롤 (추후 API 연동 시 이벤트 추가)
onMounted(() => {
  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 200
    ) {
      // API 호출 또는 더미 데이터 추가 가능
    }
  });
});
</script>

<style scoped>
.shadow-lg {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}
</style>
