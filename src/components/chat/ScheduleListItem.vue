<script setup>
import { UserIcon } from "lucide-vue-next";

const props = defineProps({
  scheduleData: { type: Object, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  datetime: { type: String, required: true },
  profileUrl: { type: String, default: "" },
});

const emit = defineEmits(["cancel"]);
const onCancel = () => emit("cancel", props.scheduleData);
</script>

<template>
  <div class="my-4 flex items-center rounded-r15 bg-gray-custom p-4">
    <div class="relative mr-4">
      <div
        class="flex h-12 w-12 items-center justify-center overflow-hidden bg-gray-600"
      >
        <template v-if="profileUrl">
          <img
            :src="profileUrl"
            alt="프로필"
            class="h-12 w-12 rounded-full object-cover"
          />
        </template>
        <template v-else>
          <UserIcon class="h-6 w-6 text-gray-300" />
        </template>
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="truncate text-[14px] font-bold text-white">{{ name }}</h3>
        <span class="text-[10px] font-bold text-white">{{ datetime }}</span>
      </div>

      <div class="flex items-center justify-between">
        <div class="min-w-0">
          <div
            class="inline-flex items-center rounded-[12px] bg-gray-600 px-3 py-1"
          >
            <span class="text-[10px] text-white">{{ category }}</span>
          </div>
        </div>

        <button
          class="rounded-pill border border-primary bg-primary/20 px-4"
          @click.stop="onCancel"
        >
          <span class="text-[11px] text-white">취소</span>
        </button>
      </div>
    </div>
  </div>
</template>
