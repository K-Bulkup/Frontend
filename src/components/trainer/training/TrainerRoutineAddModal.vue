<script setup>
import { reactive, computed, onMounted } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import BaseHeader from "@/components/common/BaseHeader.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";
import BaseSelectButton from "@/components/common/BaseSelectButton.vue";

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
  description: "",
  videoUrl: "",
  routineType: "",
  quizType: "PHOTO",
});

onMounted(() => {
  if (props.initialData) {
    Object.assign(form, props.initialData);
  }
  form.routineType = convertCategoryToKorean(props.routineCategoryKey);
});

const isSaveButtonDisabled = computed(() => {
  return !form.title.trim() || !form.description.trim();
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
  emit("save", { ...form });
};

const modalTitle = computed(() => {
  const action = props.initialData ? "루틴 수정" : "루틴 등록";
  return action;
});
</script>

<template>
  <div
    class="absolute inset-0 z-50 flex h-full w-full flex-col justify-between overflow-y-auto bg-background px-6 py-10 scrollbar-hide"
  >
    <div>
      <BaseHeader :title="modalTitle" @back="handleClose" />

      <main>
        <BaseStatusMessage
          class="mb-8 text-left"
          title="수행할 루틴을 알려주세요"
          subtitle="수강생에게 제공할 루틴을 작성해주세요"
        />

        <div class="flex flex-col space-y-6">
          <div>
            <div class="mb-4 text-input text-gray-50">루틴 유형</div>
            <BaseSelectButton v-model="form.quizType" :options="QUIZ_TYPES" />
          </div>

          <BaseFormField
            variant="dark"
            label="루틴명"
            placeholder="루틴명을 입력해주세요"
            v-model="form.title"
          />

          <BaseFormField
            variant="dark"
            label="루틴 내용"
            placeholder="루틴 내용을 입력해주세요"
            v-model="form.description"
          />

          <BaseFormField
            variant="dark"
            label="영상 URL"
            placeholder="영상 URL을 입력해주세요"
            v-model="form.videoUrl"
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
