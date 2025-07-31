<script setup>
const props = defineProps({
  isVisible: { type: Boolean, required: true },
  status: { type: String, default: "success" }, // 'success' 또는 'failure'
  reward: { type: Number, default: 1 },
});

const emit = defineEmits(["close", "retry"]);

const handleConfirm = () => {
  if (props.status === "success") {
    emit("close");
  } else {
    emit("retry");
  }
};
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
  >
    <div
      v-if="status === 'success'"
      class="w-11/12 max-w-xs rounded-2xl bg-white p-6 text-center text-black shadow-lg"
    >
      <div class="flex justify-end">
        <button @click="$emit('close')"><img src="@/assets/images/trainee/training/close_black.svg" alt="닫기"></img></button>
      </div>
      <div
        class="mx-auto -mt-2 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary"
      >
        <img src="@/assets/images/trainee/training/star_black.svg" alt="별" />
      </div>
      <h2 class="text-xl font-bold text-black">리워드 획득!</h2>

      <div class="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <div
          class="flex items-center justify-center gap-2 font-bold text-black"
        >
          <div
            class="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
          >
            <img
              src="@/assets/images/trainee/training/star_black.svg"
              alt="별"
              class="h-2 w-2"
            />
          </div>
          <span>{{ reward }} 포인트</span>
        </div>

        <p class="mt-2 text-sm text-gray-600">
          루틴을 성공적으로 완료하여<br />리워드 포인트를 획득했습니다!
        </p>
      </div>
      <div class="mt-6">
        <button
          @click="handleConfirm"
          class="w-full rounded-lg bg-primary py-3 font-bold text-black transition-opacity duration-200 hover:opacity-80"
        >
          확인
        </button>
      </div>
    </div>

    <div
      v-else
      class="w-11/12 max-w-xs rounded-2xl bg-white p-6 text-center text-black shadow-lg"
    >
      <div class="flex justify-end">
        <button @click="$emit('close')"><img src="@/assets/images/trainee/training/close_black.svg" alt="닫기" /></button>
      </div>
      <div
        class="mx-auto -mt-2 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-300"
      >
        <img src="@/assets/images/trainee/training/close_red.svg" alt="오답" class="h-6 w-6" />
      </div>
      <h2 class="text-xl font-bold">오답입니다!</h2>
      
      
      <div class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
        <div
          class="flex items-center justify-center gap-2 font-bold text-black"
        >
          <div
            class="flex h-6 w-6 items-center justify-center rounded-full bg-red-300"
          >
            <img
              src="@/assets/images/trainee/training/close_red.svg" alt="오답"
              class="h-2 w-2"
            />
          </div>
          <span class="text-red-500">다시 시도</span>
        </div>

        <p class="mt-2 text-sm text-gray-600">
          정답이 아닙니다.<br />다시 한번 시도해보세요!
        </p>
      </div>

      <div class="mt-6">
        <button
          @click="handleConfirm"
          class="w-full rounded-xl bg-red-300 py-3 font-bold text-red-500 transition-opacity duration-200 hover:opacity-80"
        >
          다시 시도
        </button>
      </div>
    </div>
  </div>
</template>
