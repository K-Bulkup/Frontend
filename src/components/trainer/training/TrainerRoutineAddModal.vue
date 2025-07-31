<script setup>
import { ref, computed } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";

// 상수
const ROUTINE_TYPES = ["실천형", "주관식", "OX"];

// emit 정의
const emit = defineEmits(["close", "save"]);

// 반응형 데이터
const routineTitle = ref("");
const routineUrl = ref("");
const routineContent = ref("");
const routineAnswer = ref("");
const selectedRoutineType = ref("");

// 계산된 속성
const isSaveButtonDisabled = computed(() => {
  return (
    !routineTitle.value.trim() ||
    !routineUrl.value.trim() ||
    !routineContent.value.trim() ||
    !routineAnswer.value.trim() ||
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
  <div
    class="absolute inset-0 z-50 flex h-full w-full flex-col justify-between overflow-y-auto bg-realBlack px-6 py-10 scrollbar-hide"
  >
    <div>
      <BaseHeader title="루틴 추가" @back="handleClose" />

      <main>
        <BaseStatusMessage
          class="mb-8 text-left"
          title="수행할 루틴을 알려주세요"
          subtitle="회원에게 제공할 루틴을 추가해주세요"
        />

        <div class="flex flex-col space-y-6">
          <BaseFormField
            label="루틴 제목"
            placeholder="루틴 제목을 입력해주세요"
            v-model="routineTitle"
          />
          <BaseFormField
            label="영상 URL"
            placeholder="영상 URL을 입력해주세요"
            v-model="routineUrl"
          />
          <BaseFormField
            label="루틴 내용"
            placeholder="루틴 내용을 입력해주세요"
            v-model="routineContent"
            :isTextarea="true"
          />

          <div>
            <div class="mb-4 text-subtext text-gray-50">루틴 유형</div>
            <div class="flex items-center gap-2.5">
              <button
                v-for="type in ROUTINE_TYPES"
                :key="type"
                :class="[
                  'flex-1 rounded-xl py-3 text-center text-subtext transition-colors',
                  selectedRoutineType === type
                    ? 'bg-primary text-black'
                    : 'bg-gray-100 text-black hover:bg-gray-200',
                ]"
                @click="selectedRoutineType = type"
              >
                {{ type }}
              </button>
            </div>
          </div>

          <BaseFormField
            label="루틴 답안"
            placeholder="루틴 답안을 입력해주세요"
            v-model="routineAnswer"
            :isTextarea="true"
          />
        </div>
      </main>
    </div>

    <div class="mt-10">
      <BaseButton :isDisabled="isSaveButtonDisabled" @click="handleSave">
        완료
      </BaseButton>
    </div>
  </div>
</template>
