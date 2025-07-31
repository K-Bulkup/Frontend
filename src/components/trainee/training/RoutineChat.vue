<script setup>
defineProps({
  photo: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div
    class="w-auto max-w-xs rounded-xl rounded-br-none bg-primary p-3 text-black"
  >
    <p v-if="photo.description" class="mb-2 break-words text-sm">
      {{ photo.description }}
    </p>
    <img
      v-if="photo.imageUrl"
      :src="photo.imageUrl"
      alt="인증 사진"
      class="w-full rounded-lg object-cover"
    />
    <div class="mt-2 text-right text-xs text-gray-700">
      {{
        new Date(photo.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      }}
    </div>
  </div>
</template>
