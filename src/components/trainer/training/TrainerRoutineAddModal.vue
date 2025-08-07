<script setup>
import { ref, computed } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";

const props = defineProps({
  routineCategoryKey: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close", "save"]);

const QUIZ_TYPES = [
  { key: "PHOTO", label: "실천형" },
  { key: "SHORT_ANSWER", label: "주관식" },
  { key: "OX", label: "OX" },
];

const routineTitle = ref("");
const routineUrl = ref("");
const routineDescription = ref("");
const routineAnswer = ref("");
const selectedQuizType = ref("PHOTO");

const isSaveButtonDisabled = computed(() => {
  const hasRequiredInfo =
    !routineTitle.value.trim() || !routineDescription.value.trim();

  if (hasRequiredInfo) {
    return true;
  }

  if (selectedQuizType.value !== "PHOTO") {
    return !routineAnswer.value.trim();
  }

  return false;
});

const handleClose = () => {
  emit("close");
};

const convertCategoryToKorean = (key) => {
  switch (key) {
    case "stretching":
      return "스트레칭";
    case "strength":
      return "근력";
    case "cardio":
      return "유산소";
    default:
      return "";
  }
};

const handleSave = () => {
  if (isSaveButtonDisabled.value) return;

  const routineData = {
    title: routineTitle.value,
    description: routineDescription.value,
    routineType: convertCategoryToKorean(props.routineCategoryKey), // DB에 저장할 한글 값으로 변환
    quizType: selectedQuizType.value,
    videoUrl: routineUrl.value || null,
    routineAnswer: routineAnswer.value || null,
  };

  console.log("DB로 전송될 실제 데이터:", routineData);
  console.log("routineCategoryKey Prop 값:", props.routineCategoryKey);

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
            variant="dark"
            label="루틴 제목"
            placeholder="루틴 제목을 입력해주세요"
            v-model="routineTitle"
          />
          <BaseFormField
            variant="dark"
            label="영상 URL"
            placeholder="영상 URL을 입력해주세요"
            v-model="routineUrl"
          />
          <BaseFormField
            variant="dark"
            label="루틴 내용"
            placeholder="루틴 내용을 입력해주세요"
            v-model="routineDescription"
            :isTextarea="true"
          />

          <div>
            <div class="mb-4 text-subtext text-gray-50">루틴 유형</div>
            <div class="flex items-center gap-2.5">
              <button
                v-for="type in QUIZ_TYPES"
                :key="type.key"
                :class="[
                  'flex-1 rounded-xl py-3 text-center text-subtext transition-colors',
                  selectedQuizType === type.key
                    ? 'bg-primary text-black'
                    : 'bg-gray-100 text-black hover:bg-gray-200',
                ]"
                @click="selectedQuizType = type.key"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <BaseFormField
            variant="dark"
            v-if="selectedQuizType !== 'PHOTO'"
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
