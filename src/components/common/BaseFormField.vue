<script setup>
import { computed, ref, onMounted, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: "",
  },
  variant: {
    type: String,
    default: "light", // 'light' | 'dark'
  },
  isTextarea: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(["update:modelValue"]);

const labelClasses = computed(() => [
  "mb-2",
  "block",
  "text-input",
  props.variant === "dark" ? "text-gray-50" : "text-black",
]);

const inputClasses = computed(() => [
  "w-full",
  "border-none",
  "bg-gray-custom",
  "p-4",
  "text-input",
  "text-white",
  "outline-none",
  "placeholder:text-gray-300",
  "rounded-r15",
  props.isTextarea ? "text-left placeholder:text-left" : "text-left",
]);

const textareaRef = ref(null);

const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = "auto";
    textareaRef.value.style.height = textareaRef.value.scrollHeight + "px";
  }
};

watch(() => props.modelValue, adjustHeight);
onMounted(adjustHeight);
</script>

<template>
  <div>
    <label :class="labelClasses">{{ label }}</label>

    <!-- Textarea -->
    <textarea
      v-if="isTextarea"
      ref="textareaRef"
      :rows="rows"
      :value="modelValue"
      @input="
        (e) => {
          emit('update:modelValue', e.target.value);
          adjustHeight();
        }
      "
      :placeholder="placeholder"
      :class="inputClasses"
      style="
        min-height: 10px;
        max-height: 120px;
        resize: none;
        overflow-y: auto;
        -ms-overflow-style: none;
        scrollbar-width: none;
      "
    />

    <!-- Input -->
    <input
      v-else
      type="text"
      :value="modelValue"
      @input="(e) => emit('update:modelValue', e.target.value)"
      :placeholder="placeholder"
      :class="inputClasses"
    />
  </div>
</template>
