<script setup>
import { ref } from "vue";
import BaseStatusMessage from "@/components/common/BaseStatusMessage.vue";
import BaseFormField from "@/components/common/BaseFormField.vue";

const trainerName = defineModel("trainerName");
const description = defineModel("description");
const difficulty = defineModel("difficulty");
const routines = defineModel("routines");

const emit = defineEmits(["open-routine-modal"]);

const DIFFICULTY_LEVELS = ["초급", "중급", "고급"];
const ROUTINE_SECTIONS = [
  { key: "stretching", title: "스트레칭" },
  { key: "strength", title: "근력" },
  { key: "cardio", title: "유산소" },
];

const expandedSections = ref({
  stretching: true,
  strength: true,
  cardio: true,
});

const handleSectionToggle = (sectionKey) => {
  expandedSections.value[sectionKey] = !expandedSections.value[sectionKey];
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
          label="트레이닝명"
          placeholder="트레이닝명을 입력해주세요"
          v-model="trainerName"
        />
      </div>
      <div class="mb-8">
        <BaseFormField
          label="트레이닝 소개"
          placeholder="트레이닝에 대한 소개를 입력해주세요"
          v-model="description"
          :isTextarea="true"
          :rows="4"
        />
      </div>

      <div class="mb-8">
        <div class="mb-4 text-subtext text-gray-50">난이도</div>
        <div class="flex items-center gap-2.5">
          <button
            v-for="level in DIFFICULTY_LEVELS"
            :key="level"
            @click="difficulty = level"
            :class="[
              'flex-1 rounded-xl py-3 text-center text-subtext transition-colors',
              difficulty === level
                ? 'bg-primary text-black'
                : 'bg-gray-100 text-black hover:bg-gray-200',
            ]"
          >
            {{ level }}
          </button>
        </div>
      </div>

      <div>
        <div class="mb-4 text-subtext text-gray-50">루틴</div>
        <div
          v-for="section in ROUTINE_SECTIONS"
          :key="section.key"
          class="mb-2.5"
        >
          <div
            @click="handleSectionToggle(section.key)"
            class="flex cursor-pointer items-center justify-between rounded-xl bg-gray-100 p-4"
          >
            <span class="text-body text-black">{{ section.title }}</span>
            <button
              @click.stop="emit('open-routine-modal', section.key)"
              class="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
            >
              <img src="@/assets/images/plus.svg" alt="추가 버튼" />
            </button>
          </div>
          <div v-if="expandedSections[section.key]" class="mt-2.5">
            <div
              v-if="routines[section.key].length > 0"
              class="flex flex-col gap-2.5 rounded-xl bg-gray-100 p-4"
            >
              <div
                v-for="routine in routines[section.key]"
                :key="routine.id"
                class="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <span class="flex-1 text-body text-black">{{
                  routine.name
                }}</span>
                <span class="text-caption text-gray-700">+1P</span>
              </div>
            </div>
            <div
              v-else
              class="rounded-xl bg-gray-800 p-4 text-center text-subtext text-gray-700"
            >
              루틴을 추가해주세요
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
