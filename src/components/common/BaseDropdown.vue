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
};

const handleOptionSelect = (option) => {
  // 객체 배열인 경우 valueKey에 해당하는 값을, 아니면 옵션 자체를 사용
  const value = props.valueKey ? option[props.valueKey] : option;
  selectedValue.value = value;
  isDropdownOpen.value = false;
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
  <div class="w-full px-4 pb-3 pt-2">
    <!-- 라벨 -->
    <label class="mb-2 block text-sm text-white">
      {{ label }}
    </label>

    <div class="relative flex justify-center">
      <!-- 드롭다운 버튼 -->
      <button
        @click="toggleDropdown"
        class="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-left focus:outline-none"
        style="width: 360px; height: 60px"
      >
        <span
          :class="isPlaceholder ? 'text-gray-500' : 'text-black'"
          class="text-sm"
        >
          {{ displayValue }}
        </span>
        <svg
          class="h-5 w-5 text-gray-400 transition-transform"
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
          class="absolute left-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          style="width: 360px"
        >
          <button
            v-for="(option, index) in options"
            :key="index"
            @click="handleOptionSelect(option)"
            @mouseenter="hoveredOption = getOptionValue(option)"
            @mouseleave="hoveredOption = null"
            class="flex items-center px-4 py-3 text-left text-sm transition-colors focus:outline-none"
            style="width: 360px; height: 60px"
            :class="[
              // 선택된 상태
              getOptionValue(option) === selectedValue
                ? 'bg-primary font-medium text-black'
                : // hover 상태
                  hoveredOption === getOptionValue(option)
                  ? 'bg-gray-200 text-black'
                  : // 기본 상태
                    'bg-white text-black',
              // active 스타일
              getOptionValue(option) !== selectedValue
                ? 'active:bg-primary active:text-black'
                : '',
            ]"
          >
            {{ getOptionDisplay(option) }}
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>
