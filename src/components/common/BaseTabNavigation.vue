<!-- TabNavigation.vue -->
<script setup>
import { ref, watch } from "vue";

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

// 탭 변경 함수
const setActiveTab = (tabId) => {
  activeTab.value = tabId;
  emit("tab-change", tabId);
};

// props.defaultTab이 변경되면 activeTab도 업데이트
watch(
  () => props.defaultTab,
  (newTab) => {
    if (newTab) {
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
    <div class="my-4 max-h-[480px] overflow-y-auto scrollbar-hide">
      <template v-for="tab in tabs" :key="`content-${tab.id}`">
        <div v-if="activeTab === tab.id">
          <slot :name="tab.id" :tab="tab" :active-tab="activeTab">
            <!-- 기본 컨텐츠 (슬롯이 제공되지 않은 경우) -->
            <div class="py-8 text-center text-gray-500">
              {{ tab.label }} 컨텐츠가 없습니다.
            </div>
          </slot>
        </div>
      </template>
    </div>
  </div>
</template>
