<script setup>
import { computed } from "vue";
import { UserIcon } from "lucide-vue-next";

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  isOwn: {
    type: Boolean,
    default: false,
  },
});

const messageClasses = computed(() => {
  return props.isOwn
    ? "bg-primary text-black rounded-br-sm"
    : "bg-white text-black rounded-bl-sm";
});
</script>

<template>
  <div
    class="mb-4 flex"
    :class="{ 'justify-end': isOwn, 'justify-start': !isOwn }"
  >
    <div
      v-if="!isOwn"
      class="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white"
    >
      <UserIcon class="h-5 w-5 text-gray-600" />
    </div>
    <div class="max-w-xs lg:max-w-md">
      <div class="rounded-2xl px-4 py-3 text-sm" :class="messageClasses">
        {{ message }}
      </div>
      <div
        class="mt-1 text-xs text-gray-500"
        :class="{ 'text-right': isOwn, 'text-left': !isOwn }"
      >
        {{ timestamp }}
      </div>
    </div>
    <div
      v-if="isOwn"
      class="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white"
    >
      <UserIcon class="h-5 w-5 text-gray-600" />
    </div>
  </div>
</template>
