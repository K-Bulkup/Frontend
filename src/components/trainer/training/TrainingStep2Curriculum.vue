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

const emit = defineEmits(["open-routine-modal", "edit-routine"]);

const DIFFICULTY_LEVELS = ["초급", "중급", "고급"];
const ROUTINE_SECTIONS = [
  { key: "stretching", title: "스트레칭" },
  { key: "strength", title: "근력" },
  { key: "cardio", title: "유산소" },
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
      subtitle="회원에게 보여줄 커리큘럼을 작성해주세요"
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
        <div class="text-input mb-4 text-gray-50">난이도</div>
        <div class="flex items-center gap-2.5">
          <BaseSelectButton v-model="difficulty" :options="DIFFICULTY_LEVELS" />
        </div>
      </div>

      <div>
        <div class="text-input mb-4 text-gray-50">루틴</div>
        <TrainerRoutineSection
          v-for="section in ROUTINE_SECTIONS"
          :key="section.key"
          :title="section.title"
          :routines="routines[section.key]"
          :is-expanded="isSectionExpanded(section.key)"
          @toggle="handleSectionToggle(section.key)"
          @add-routine="emit('open-routine-modal', section.key)"
          @edit-routine="emit('edit-routine', $event)"
        />
      </div>
    </main>
  </div>
</template>
