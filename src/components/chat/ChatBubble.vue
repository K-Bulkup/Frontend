<script setup>
import { computed } from "vue";
import { UserIcon } from "lucide-vue-next";
import profileImg from "@/assets/images/mascot/profile.png";

const props = defineProps({
  message: String,
  timestamp: String,
  isOwn: Boolean,
  profileUrl: String,
  isAiChat: Boolean,
});

const messageClasses = computed(() =>
  props.isOwn
    ? "bg-primary text-black rounded-br-sm"
    : "bg-white text-black rounded-bl-sm",
);

const profileImage = computed(() => {
  if (props.isAiChat && !props.isOwn) {
    return profileImg;
  }
  return props.profileUrl || null;
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
      <template v-if="profileImage">
        <img
          :src="profileImage"
          alt="프로필 이미지"
          class="h-5 w-5 rounded-full"
        />
      </template>
      <template v-else>
        <UserIcon class="h-5 w-5 text-gray-600" />
      </template>
    </div>

    <div class="max-w-xs lg:max-w-md">
      <div
        class="whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm"
        :class="messageClasses"
      >
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
      <template v-if="profileImage">
        <img
          :src="profileImage"
          alt="내 프로필 이미지"
          class="h-5 w-5 rounded-full"
        />
      </template>
      <template v-else>
        <UserIcon class="h-5 w-5 text-gray-600" />
      </template>
    </div>
  </div>
</template>
