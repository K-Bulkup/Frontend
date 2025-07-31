<script setup>
import { ref } from "vue";
import { SendIcon } from "lucide-vue-next";

const props = defineProps({
  placeholder: {
    type: String,
    default: "메시지를 입력하세요...",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["send"]);

const inputMessage = ref("");

const sendMessage = () => {
  if (inputMessage.value.trim()) {
    emit("send", inputMessage.value.trim());
    inputMessage.value = "";
  }
};
</script>

<template>
  <div class="bottom-4 border-t border-gray-800 p-4">
    <div class="flex items-center space-x-3">
      <div class="relative flex-1">
        <input
          v-model="inputMessage"
          type="text"
          :placeholder="placeholder"
          :disabled="disabled"
          class="w-full rounded-full bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
          @keypress.enter="sendMessage"
        />
      </div>
      <button
        @click="sendMessage"
        :disabled="!inputMessage.trim()"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SendIcon class="h-5 w-5 text-black" />
      </button>
    </div>
  </div>
</template>
