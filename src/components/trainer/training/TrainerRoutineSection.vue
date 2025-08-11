<script setup>
import BaseTag from "@/components/common/BaseTag.vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  routines: {
    type: Array,
    default: () => [],
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
  showAddButton: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["toggle", "add-routine", "edit-routine"]);
</script>

<template>
  <div class="mb-4">
    <div
      @click="emit('toggle')"
      class="flex cursor-pointer items-center justify-between p-4"
    >
      <div class="flex items-center gap-3">
        <div class="h-[60px] w-[60px] rounded-[15px] bg-gray-800"></div>
        <div class="flex flex-col">
          <span class="text-body text-white">{{ title }}</span>
          <span class="text-caption text-gray-400">루틴을 입력해주세요</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="showAddButton"
          @click.stop="emit('add-routine')"
          class="hover:text-primary-dark flex items-center justify-center gap-2 text-body text-primary transition-colors"
        >
          <span class="text-xl">+</span>
          <span>루틴 추가</span>
        </button>
        <img
          src="@/assets/images/Chevron_Down_XL.svg"
          alt="펼치기"
          class="h-5 w-5 transition-transform"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </div>

    <div v-if="isExpanded" class="mt-2 space-y-2">
      <div v-if="routines.length > 0" class="space-y-2">
        <div
          v-for="routine in routines"
          :key="routine.id"
          @click="emit('edit-routine', routine)"
          class="bg-gray-custom rounded-15 flex cursor-pointer items-center p-3 transition-colors hover:bg-gray-700"
        >
          <div class="flex items-center gap-4">
            <span class="pl-2 text-body text-white">{{ routine.title }}</span>
            <BaseTag :text="routine.tag" />
          </div>
        </div>
      </div>
      <div v-else class="p-4 text-center">
        <p class="mb-3 text-subtext text-gray-400">루틴이 없습니다</p>
      </div>
    </div>
  </div>
</template>
