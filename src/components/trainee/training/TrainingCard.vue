<template>
  <div
    class="mb-3 rounded-md border border-gray-200 bg-white p-4 shadow-md transition-all duration-300 hover:border-primary"
  >
    <h3 class="mb-1 text-heading font-semibold text-black">
      {{ training.title }}
    </h3>
    <p class="mb-2 text-subtext text-gray-700">
      {{ training.description }}
    </p>
    <span class="text-caption font-bold uppercase text-primary">
      {{ training.level }}
    </span>
  </div>
</template>

<script>
export default {
  name: "TrainingCard",
  props: {
    training: {
      type: Object,
      required: true,
    },
  },
};
</script>
