<script setup>
import { ref } from "vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";
import TrainerRoutineSection from "./TrainerRoutineSection.vue";
import BaseSelectButton from "@/components/common/BaseSelectButton.vue";

const trainerName = defineModel("trainerName");
const description = defineModel("description");
const difficulty = defineModel("difficulty");
const routines = defineModel("routines");

// [수정됨] 이제 부모에게 카테고리 키 없이 모달을 열어달라는 신호만 보냄
const emit = defineEmits(["open-routine-modal", "edit-routine"]);

const DIFFICULTY_LEVELS = ["초급", "중급", "고급"];
const ROUTINE_SECTIONS = [
  { key: "stretching", title: "스트레칭", subtitle: "준비와 기초 다지기" },
  { key: "strength", title: "근력", subtitle: "성장을 위한 역량 축적" },
  { key: "cardio", title: "유산소", subtitle: "꾸준한 관리 습관 형성" },
];

const manuallyToggled = ref({});

const isSectionExpanded = (sectionKey) => {
  if (manuallyToggled.value[sectionKey] !== undefined) {
    return manuallyToggled.value[sectionKey];
  }

  return (routines.value?.[sectionKey]?.length || 0) > 0;
};

const handleSectionToggle = (sectionKey) => {
  manuallyToggled.value[sectionKey] = !isSectionExpanded(sectionKey);
};
</script>

<template>
  <div>
    <BaseStatusMessage
      class="mb-8 text-left"
      title="트레이닝 커리큘럼을 알려주세요"
      subtitle="수강생에게 보여줄 커리큘럼을 작성해주세요"
      variant="guide"
    />

    <main>
      <div class="mb-6">
        <BaseFormField
          variant="dark"
          label="트레이닝명"
          placeholder="트레이닝명을 입력해주세요"
          v-model="trainerName"
        />
      </div>
      <div class="mb-8">
        <BaseFormField
          variant="dark"
          label="트레이닝 소개"
          placeholder="트레이닝에 대한 소개를 입력해주세요"
          v-model="description"
          :rows="4"
        />
      </div>

      <div class="mb-8">
        <div class="mb-4 text-input text-gray-50">난이도</div>
        <div class="flex items-center gap-2.5">
          <BaseSelectButton v-model="difficulty" :options="DIFFICULTY_LEVELS" />
        </div>
      </div>

      <div>
        <div class="mb-4 flex items-center justify-between">
          <div class="text-input text-gray-50">루틴</div>
          <!-- 루틴 추가 버튼 -->
          <button
            @click="emit('open-routine-modal')"
            class="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 transition-colors active:bg-gray-800"
          >
            <img
              src="@/assets/images/plus_green.svg"
              alt="추가"
              class="h-5 w-5"
            />
            <span class="text-button text-white">루틴 추가</span>
          </button>
        </div>
        <TrainerRoutineSection
          v-for="section in ROUTINE_SECTIONS"
          :key="section.key"
          :title="section.title"
          :subtitle="section.subtitle"
          :routines="routines[section.key]"
          :is-expanded="isSectionExpanded(section.key)"
          @toggle="handleSectionToggle(section.key)"
          @edit-routine="emit('edit-routine', $event)"
        />
      </div>
    </main>
  </div>
</template>
