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
  <header class="flex items-center justify-between px-5 pb-3 pt-8">
    <button @click="handleBack">
      <img src="@/assets/images/arrow-back.png" alt="뒤로가기" />
    </button>
    <h2 class="text-heading text-white">{{ title }}</h2>
    <div>
      <slot name="actions"></slot>
    </div>
  </header>
</template>
