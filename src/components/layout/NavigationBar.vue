<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const userStore = useAuthStore();
const router = useRouter();

const userType = computed(() => userStore.role || "trainee");

// ✅ 현재 선택된 탭 상태
const activeTab = ref("home");

// 트레이니용
const navigateToTraineeTraining = () => {
  activeTab.value = "training";
  router.push("/training");
};

const navigateToTraineeMyPage = () => {
  activeTab.value = "home";
  router.push("/trainee/mypage");
};

const navigateToTraineeAssets = () => {
  activeTab.value = "asset";
  router.push("/trainee/asset");
};

// 트레이너용
const navigateToTrainerTraining = () => {
  activeTab.value = "training";
  router.push("/trainer/mypage/training");
};

const navigateToTrainerMyPage = () => {
  activeTab.value = "home";
  router.push("/trainer/mypage");
};

const navigateToTrainerPtHistory = () => {
  activeTab.value = "pt-history";
  router.push("/trainer/mypage/pt-history");
};
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 flex h-16 items-center justify-around border-t border-gray-700 bg-realBlack"
  >
    <template v-if="userType === 'trainee'">
      <div
        class="flex cursor-pointer flex-col items-center transition-opacity hover:opacity-80"
        @click="navigateToTraineeTraining"
      >
        <font-awesome-icon
          :icon="['fas', 'book']"
          class="mb-1"
          :class="activeTab === 'training' ? 'text-primary' : 'text-white'"
        />
        <span
          class="text-caption"
          :class="activeTab === 'training' ? 'text-primary' : 'text-white'"
        >
          트레이닝
        </span>
      </div>

      <div
        class="flex cursor-pointer flex-col items-center transition-opacity hover:opacity-80"
        @click="navigateToTraineeMyPage"
      >
        <font-awesome-icon
          :icon="['fas', 'home']"
          class="mb-1"
          :class="activeTab === 'home' ? 'text-primary' : 'text-white'"
        />
        <span
          class="text-caption"
          :class="activeTab === 'home' ? 'text-primary' : 'text-white'"
        >
          홈
        </span>
      </div>

      <div
        class="flex cursor-pointer flex-col items-center transition-opacity hover:opacity-80"
        @click="navigateToTraineeAssets"
      >
        <font-awesome-icon
          :icon="['fas', 'layer-group']"
          class="mb-1"
          :class="activeTab === 'asset' ? 'text-primary' : 'text-white'"
        />
        <span
          class="text-caption"
          :class="activeTab === 'asset' ? 'text-primary' : 'text-white'"
        >
          자산
        </span>
      </div>
    </template>

    <template v-else>
      <div
        class="flex cursor-pointer flex-col items-center transition-opacity hover:opacity-80"
        @click="navigateToTrainerTraining"
      >
        <font-awesome-icon
          :icon="['fas', 'book']"
          class="mb-1"
          :class="activeTab === 'training' ? 'text-primary' : 'text-white'"
        />
        <span
          class="text-caption"
          :class="activeTab === 'training' ? 'text-primary' : 'text-white'"
        >
          트레이닝
        </span>
      </div>

      <div
        class="flex cursor-pointer flex-col items-center transition-opacity hover:opacity-80"
        @click="navigateToTrainerMyPage"
      >
        <font-awesome-icon
          :icon="['fas', 'home']"
          class="mb-1"
          :class="activeTab === 'home' ? 'text-primary' : 'text-white'"
        />
        <span
          class="text-caption"
          :class="activeTab === 'home' ? 'text-primary' : 'text-white'"
        >
          홈
        </span>
      </div>

      <div
        class="flex cursor-pointer flex-col items-center transition-opacity hover:opacity-80"
        @click="navigateToTrainerPtHistory"
      >
        <font-awesome-icon
          :icon="['fas', 'comments']"
          class="mb-1"
          :class="activeTab === 'pt-history' ? 'text-primary' : 'text-white'"
        />
        <span
          class="text-caption"
          :class="activeTab === 'pt-history' ? 'text-primary' : 'text-white'"
        >
          1:1 PT
        </span>
      </div>
    </template>
  </nav>
</template>
