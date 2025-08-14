<!-- TabNavigation.vue -->
<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    default: () => [],
  },
  defaultTab: {
    type: String,
    required: true,
  },
  containerClass: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["tab-change"]);

// 기본 탭 설정
const activeTab = ref(
  props.defaultTab || (props.tabs.length > 0 ? props.tabs[0].id : ""),
);

// 이전 탭 인덱스와 현재 탭 인덱스 추적
const previousTabIndex = ref(0);
const currentTabIndex = computed(() =>
  props.tabs.findIndex((tab) => tab.id === activeTab.value),
);

// 슬라이드 방향 결정
const slideDirection = computed(() => {
  return currentTabIndex.value > previousTabIndex.value
    ? "slide-left"
    : "slide-right";
});

// 탭 변경 함수
const setActiveTab = (tabId) => {
  previousTabIndex.value = currentTabIndex.value;
  activeTab.value = tabId;
  emit("tab-change", tabId);
};

// props.defaultTab이 변경되면 activeTab도 업데이트
watch(
  () => props.defaultTab,
  (newTab) => {
    if (newTab) {
      previousTabIndex.value = currentTabIndex.value;
      activeTab.value = newTab;
    }
  },
);
</script>

<template>
  <div :class="containerClass">
    <!-- 탭 네비게이션 -->
    <div class="flex border-b border-gray-800 font-bold">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="setActiveTab(tab.id)"
        :class="[
          'font-body2 flex-1 px-6 py-4 text-center text-sm transition-colors duration-200',
          activeTab === tab.id
            ? 'text-primary'
            : 'text-gray-300 hover:text-primary',
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 탭 컨텐츠 -->
    <div class="relative my-4 overflow-hidden">
      <TransitionGroup :name="slideDirection" tag="div" class="relative">
        <div
          v-for="tab in tabs"
          v-show="activeTab === tab.id"
          :key="tab.id"
          class="w-full"
        >
          <slot :name="tab.id" :tab="tab" :active-tab="activeTab">
            <!-- 기본 컨텐츠 (슬롯이 제공되지 않은 경우) -->
            <div class="py-8 text-center text-gray-500">
              {{ tab.label }} 컨텐츠가 없습니다.
            </div>
          </slot>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-left-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

/* 오른쪽으로 슬라이드 (이전 탭으로) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
</style>
