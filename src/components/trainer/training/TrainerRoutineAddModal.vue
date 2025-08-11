<script setup>
import { reactive, computed, onMounted } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
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

const form = reactive({
  id: null,
  title: "",
  videoUrl: "",
  description: "",
  routineType: "",
  quizType: "PHOTO",
  routineAnswer: "",
});

// 컴포넌트가 생성될 때(key가 바뀔 때마다) 실행되는 로직 추가
onMounted(() => {
  // 수정 모드이면 initialData 복사해서 넣기
  if (props.initialData) {
    Object.assign(form, props.initialData);
  }
  form.routineType = convertCategoryToKorean(props.routineCategoryKey);
});

const isSaveButtonDisabled = computed(() => {
  const hasRequiredInfo = !form.title.trim() || !form.description.trim();
  if (hasRequiredInfo) return true;
  if (form.quizType !== "PHOTO") {
    return !form.routineAnswer.trim();
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
  // form 객체의 복사본을 부모에게 전달 (id가 있으면 수정, 없으면 추가로 인식)
  emit("save", { ...form });
};

const modalTitle = computed(() => {
  const action = props.initialData ? "루틴 수정" : "루틴 추가";
  return action;
});
</script>

<template>
  <div
    class="bg-background absolute inset-0 z-50 flex h-full w-full flex-col justify-between overflow-y-auto px-6 py-10 scrollbar-hide"
  >
    <div>
      <BaseHeader :title="modalTitle" @back="handleClose" />

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
            v-model="form.title"
          />
          <BaseFormField
            variant="dark"
            label="영상 URL"
            placeholder="영상 URL을 입력해주세요"
            v-model="form.videoUrl"
          />
          <BaseFormField
            variant="dark"
            label="루틴 내용"
            placeholder="루틴 내용을 입력해주세요"
            v-model="form.description"
          />

          <div>
            <div class="mb-4 text-subtext text-gray-50">루틴 유형</div>
            <div class="flex items-center gap-2.5">
              <button
                v-for="type in QUIZ_TYPES"
                :key="type.key"
                :class="[
                  'flex-1 rounded-xl py-3 text-center text-subtext transition-colors',
                  form.quizType === type.key
                    ? 'bg-primary text-black'
                    : 'bg-gray-100 text-black hover:bg-gray-200',
                ]"
                @click="form.quizType = type.key"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <BaseFormField
            variant="dark"
            v-if="form.quizType !== 'PHOTO'"
            label="루틴 답안"
            placeholder="루틴 답안을 입력해주세요"
            v-model="form.routineAnswer"
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
