<script setup>
import { ref, computed } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";

// 상수
const ROUTINE_TYPES = ["실천형", "주관식", "OX"];

// emit 정의
const emit = defineEmits(["close", "save"]);

// 반응형 데이터
const routineTitle = ref("");
const routineUrl = ref("");
const routineContent = ref("");
const selectedRoutineType = ref("");

// 계산된 속성
const isSaveButtonDisabled = computed(() => {
  return (
    !routineTitle.value.trim() ||
    !routineUrl.value.trim() ||
    !routineContent.value.trim() ||
    !selectedRoutineType.value
  );
});

// 메서드
const handleClose = () => {
  emit("close");
};

const handleSave = () => {
  if (isSaveButtonDisabled.value) return;

  const routineData = {
    name: routineTitle.value,
    url: routineUrl.value,
    content: routineContent.value,
    type: selectedRoutineType.value,
  };

  emit("save", routineData);
};
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black bg-opacity-50">
    <div
      class="flex h-full w-full flex-col justify-between overflow-y-auto bg-realBlack px-6 py-10"
    >
      <div>
        <header class="mb-6 flex items-center justify-between">
          <button @click="handleClose" class="text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <h2 class="text-heading text-white">루틴 추가</h2>
          <div class="w-6"></div>
        </header>

        <main>
          <BaseStatusMessage
            class="mb-8 text-left"
            title="수행할 루틴을 알려주세요"
            subtitle="회원에게 제공할 루틴을 추가해주세요"
          />

          <div class="flex flex-col space-y-6">
            <div>
              <label class="mb-2 block text-subtext text-gray-50"
                >루틴 제목</label
              >
              <input
                v-model="routineTitle"
                type="text"
                placeholder="루틴 제목을 입력해주세요"
                class="w-full rounded-md border-none bg-gray-100 p-4 text-body text-black outline-none placeholder:text-gray-700"
              />
            </div>

            <div>
              <label class="mb-2 block text-subtext text-gray-50"
                >영상 URL</label
              >
              <input
                v-model="routineUrl"
                type="text"
                placeholder="영상 URL을 입력해주세요"
                class="w-full rounded-md border-none bg-gray-100 p-4 text-body text-black outline-none placeholder:text-gray-700"
              />
            </div>

            <div>
              <label class="mb-2 block text-subtext text-gray-50"
                >루틴 내용</label
              >
              <textarea
                v-model="routineContent"
                placeholder="루틴 내용을 입력해주세요"
                rows="4"
                class="w-full resize-none rounded-md border-none bg-gray-100 p-4 text-body text-black outline-none placeholder:text-gray-700"
              ></textarea>
            </div>

            <div>
              <div class="mb-4 text-subtext text-gray-50">루틴 유형</div>
              <div class="flex items-center gap-2.5">
                <button
                  v-for="type in ROUTINE_TYPES"
                  :key="type"
                  @click="selectedRoutineType = type"
                  :class="[
                    'flex-1 rounded-md py-3 text-center text-subtext transition-colors',
                    selectedRoutineType === type
                      ? 'bg-primary text-black'
                      : 'bg-gray-100 text-black hover:bg-gray-200',
                  ]"
                >
                  {{ type }}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div class="mt-10">
        <BaseButton :isDisabled="isSaveButtonDisabled" @click="handleSave">
          완료
        </BaseButton>
      </div>
    </div>
  </div>
</template>
