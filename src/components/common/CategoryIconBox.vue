<script setup>
defineProps({
  bgColor: {
    type: String,
    default: "bg-gray-custom",
  },
  iconSrc: {
    type: String,
    default: "",
  },
  altText: {
    type: String,
    default: "아이콘",
  },
});
</script>

<template>
  <div
    :class="[
      'flex h-[60px] w-[60px] items-center justify-center rounded-r15',
      bgColor,
    ]"
  >
    <img
      v-if="iconSrc"
      :src="iconSrc"
      :alt="altText"
      class="h-10 w-10 object-contain"
    />
  </div>
</template>
