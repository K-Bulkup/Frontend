<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "선택",
  },
  placeholder: {
    type: String,
    default: "항목을 선택해주세요",
  },
  options: {
    type: Array,
    default: () => [],
  },
  displayKey: {
    type: String,
    default: null,
  },
  valueKey: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isDropdownOpen = ref(false);
const selectedValue = ref(props.modelValue);
const hoveredOption = ref(null);
const clickedOption = ref(null); // 클릭된 옵션 상태 추가

// modelValue 변경 감지
watch(
  () => props.modelValue,
  (newValue) => {
    selectedValue.value = newValue;
  },
);

// selectedValue 변경 시 emit
watch(selectedValue, (newValue) => {
  emit("update:modelValue", newValue);
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;

  // 드롭다운이 열릴 때 클릭된 상태 초기화
  if (isDropdownOpen.value) {
    clickedOption.value = null;
  }
};

const handleOptionSelect = (option) => {
  // 클릭하자마자 바로 색상 변경
  const optionValue = getOptionValue(option);
  clickedOption.value = optionValue;

  // 객체 배열인 경우 valueKey에 해당하는 값을, 아니면 옵션 자체를 사용
  const value = props.valueKey ? option[props.valueKey] : option;

  // 약간의 지연 후 값 업데이트 및 드롭다운 닫기
  setTimeout(() => {
    selectedValue.value = value;
    isDropdownOpen.value = false;
    clickedOption.value = null;
  }, 150);
};

// 옵션의 표시 텍스트를 반환하는 함수
const getOptionDisplay = (option) => {
  return props.displayKey ? option[props.displayKey] : option;
};

// 옵션의 값을 반환하는 함수
const getOptionValue = (option) => {
  return props.valueKey ? option[props.valueKey] : option;
};

// computed로 반응형 계산
const displayValue = computed(() => {
  if (!selectedValue.value) return props.placeholder;

  // 선택된 값에 해당하는 옵션 찾기
  const selectedOption = props.options.find((option) => {
    const optionValue = getOptionValue(option);
    return optionValue === selectedValue.value;
  });

  if (selectedOption) {
    return getOptionDisplay(selectedOption);
  }

  return selectedValue.value;
});

const isPlaceholder = computed(() => {
  return !selectedValue.value;
});
</script>

<template>
  <div class="w-full px-4 pt-2">
    <!-- 라벨 -->
    <label class="mb-2 block pl-5 text-input text-gray-300">
      {{ label }}
    </label>

    <div class="relative flex justify-center">
      <!-- 드롭다운 버튼 -->
      <button
        @click="toggleDropdown"
        class="flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3 text-left focus:outline-none"
        style="width: 332px; height: 64px"
      >
        <span
          :class="isPlaceholder ? 'text-gray-500' : 'text-gray-300'"
          class="text-sm"
        >
          {{ displayValue }}
        </span>
        <svg
          class="h-5 w-5 text-gray-300 transition-transform"
          :class="{ 'rotate-180': isDropdownOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- 드롭다운 옵션들 -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isDropdownOpen"
          class="absolute top-full z-10 mt-1 overflow-hidden rounded-xl bg-gray-900 shadow-lg"
          style="width: 332px"
        >
          <button
            v-for="(option, index) in options"
            :key="index"
            @click="handleOptionSelect(option)"
            @mouseenter="hoveredOption = getOptionValue(option)"
            @mouseleave="hoveredOption = null"
            class="flex items-center justify-center rounded-2xl px-4 py-3 text-center text-body transition-colors"
            style="width: 332px; height: 80px"
            :class="[
              // 클릭된 상태 (최우선)
              clickedOption === getOptionValue(option)
                ? 'bg-primary text-black'
                : // hover 상태
                  hoveredOption === getOptionValue(option)
                  ? 'bg-primary/10 text-white'
                  : // 기본 상태
                    'bg-gray-900 text-white',
            ]"
          >
            {{ getOptionDisplay(option) }}
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>
