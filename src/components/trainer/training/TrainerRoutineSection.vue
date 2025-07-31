<script setup>
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
});

const emit = defineEmits(["toggle", "add-routine"]);
</script>

<template>
  <div class="mb-2.5">
    <div
      @click="emit('toggle')"
      class="flex cursor-pointer items-center justify-between rounded-xl bg-gray-100 p-4"
    >
      <span class="text-body text-black">{{ title }}</span>
      <button
        @click.stop="emit('add-routine')"
        class="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
      >
        <img src="@/assets/images/plus.svg" alt="추가 버튼" />
      </button>
    </div>

    <div v-if="isExpanded" class="mt-2.5">
      <div
        v-if="routines.length > 0"
        class="flex flex-col gap-2.5 rounded-xl bg-gray-100 p-4"
      >
        <div
          v-for="routine in routines"
          :key="routine.id"
          class="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
        >
          <span class="flex-1 text-body text-black">{{ routine.name }}</span>
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
</template>
