<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["back"]);

const handleBack = () => {
  emit("back");
};
</script>

<template>
  <header class="mb-6 flex h-10 items-center justify-between">
    <button @click="handleBack" class="p-1">
      <img src="@/assets/images/arrow-back.svg" alt="뒤로가기" />
    </button>
    <h2 class="text-white">{{ title }}</h2>
    <div class="w-8"></div>
  </header>
</template>
