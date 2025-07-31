<script setup>
defineProps({
  title: String,
  quests: Array,
  isLocked: Boolean,
  isExpanded: Boolean,
});

const emit = defineEmits(["toggle", "routine-click"]);
</script>

<template>
  <div>
    <div
      @click="emit('toggle')"
      class="flex items-center justify-between rounded-xl p-4"
      :class="{
        'cursor-pointer bg-gray-100': !isLocked,
        'bg-gray-800 text-gray-700': isLocked,
      }"
    >
      <span
        class="text-body"
        :class="isLocked ? 'text-gray-700' : 'text-black'"
      >
        {{ title }}
      </span>
      <img
        v-if="isLocked"
        src="@/assets/images/trainee/training/lock.svg"
        alt="잠금"
        class="h-5 w-5"
      />
      <img
        v-else
        src="@/assets/images/Chevron_Down_M.svg"
        alt="펼치기"
        class="h-5 w-5 transition-transform"
        :class="{ 'rotate-180': isExpanded }"
      />
    </div>

    <div v-if="isExpanded && !isLocked" class="mt-2.5">
      <div class="flex flex-col gap-2.5 rounded-xl bg-gray-100 p-4">
        <div
          v-for="quest in quests"
          :key="quest.id"
          @click="emit('routine-click', quest)"
          class="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4 transition-colors duration-200 hover:border-gray-500"
          :class="quest.completed ? 'bg-white' : 'bg-gray-200'"
        >
          <span class="flex-1 text-body text-black">{{ quest.name }}</span>

          <div
            v-if="quest.completed"
            class="flex items-center gap-2 text-subtext font-semibold text-[#28A745]"
          >
            <img
              src="@/assets/images/trainee/training/Check_Green.svg"
              alt="완료"
              class="h-4 w-4"
            />
            <span>완료</span>
          </div>
          <span v-else class="text-caption text-gray-700"
            >+{{ quest.reward }}P</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
