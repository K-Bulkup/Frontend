<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select"]);

const buttonClass = computed(() => [
  "w-full rounded-r15 border border-solid py-[18px] text-center text-input transition-colors",
  props.isSelected
    ? "border-primary bg-primary/20"
    : "border-transparent bg-gray-custom text-white hover:bg-[#353535]/60",
]);

const handleClick = () => {
  emit("select", props.label);
};
</script>

<template>
  <button :class="buttonClass" @click="handleClick">
    {{ label }}
  </button>
</template>
