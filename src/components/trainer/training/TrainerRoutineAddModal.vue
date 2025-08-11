<script setup>
import { ref, reactive, computed, onMounted } from "vue";
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
});

const emit = defineEmits(["close", "save"]);

const ROUTINE_CATEGORIES = [
  { key: "스트레칭", title: "스트레칭", subtitle: "준비와<br>기초 다지기" },
  { key: "근력", title: "근력", subtitle: "성장을 위한<br>역량 축적" },
  { key: "유산소", title: "유산소", subtitle: "꾸준한<br>관리 습관 형성" },
];

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
  quizType: "",
});

const isUrlInputVisible = ref(false);

onMounted(() => {
  if (props.initialData) {
    Object.assign(form, props.initialData);
    if (form.videoUrl) {
      isUrlInputVisible.value = true;
    }
  } else {
    form.routineType = "스트레칭";
    form.quizType = "";
  }
});

const isSaveButtonDisabled = computed(() => {
  return !form.title.trim() || !form.description.trim() || !form.routineType;
});

const handleClose = () => {
  emit("close");
};

const handleSave = () => {
  if (isSaveButtonDisabled.value) return;
  emit("save", { ...form });
};

const modalTitle = computed(() => {
  return props.initialData ? "루틴 수정" : "루틴 등록";
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

        <div class="mb-4 text-input text-gray-50">루틴 카테고리</div>
        <div
          class="rounded-r15 mb-6 flex items-center justify-around bg-gray-custom px-3 py-5"
        >
          <div
            v-for="category in ROUTINE_CATEGORIES"
            :key="category.key"
            class="flex cursor-pointer flex-col items-center gap-2 text-center"
            @click="form.routineType = category.key"
          >
            <div
              :class="[
                'rounded-r15 flex h-[60px] w-[60px] items-center justify-center bg-gray-600 transition-all',
                {
                  'border-2 border-primary': form.routineType === category.key,
                },
              ]"
            ></div>
            <div class="flex flex-col">
              <span class="text-body text-white">{{ category.title }}</span>
              <span
                class="text-body4 text-gray-50"
                v-html="category.subtitle"
              ></span>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <div class="mb-4 text-input text-gray-50">퀴즈 유형</div>
          <BaseSelectButton v-model="form.quizType" :options="QUIZ_TYPES" />
        </div>

        <transition name="fade">
          <div v-if="form.quizType" class="flex flex-col space-y-6">
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
            <div>
              <div v-if="!isUrlInputVisible" class="flex items-center gap-2">
                <label class="text-input text-gray-50">영상 URL</label>
                <button @click="isUrlInputVisible = true">
                  <img
                    src="@/assets/images/plus_green.svg"
                    alt="URL 추가"
                    class="h-5 w-5"
                  />
                </button>
              </div>
              <BaseFormField
                v-if="isUrlInputVisible"
                variant="dark"
                label="영상 URL"
                placeholder="영상 URL을 입력해주세요"
                v-model="form.videoUrl"
              />
            </div>
          </div>
        </transition>
      </main>
    </div>

    <div class="mt-10">
      <BaseButton :isDisabled="isSaveButtonDisabled" @click="handleSave">
        완료
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
