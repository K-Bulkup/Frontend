<script setup>
defineProps({
  userName: {
    type: String,
    required: true,
  },
  stats: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="relative h-96 rounded-3xl border border-gray-200 p-6">
    <div class="mb-8 flex items-start justify-between">
      <div>
        <p class="mb-2 text-sm text-gray-300">{{ userName }}</p>
        <h1 class="text-2xl font-bold text-white">{{ stats }}</h1>
      </div>
    </div>

    <div
      class="absolute inset-x-6 bottom-20 top-32 flex items-center justify-center"
    >
      <img
        src="@/assets/images/mascot/keumyook.png"
        alt="금육이 캐릭터"
        class="max-h-full max-w-full object-contain"
      />
    </div>
  </div>
</template>
