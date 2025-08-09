<script setup>
import { computed } from "vue";

import lev100_img1 from "@/assets/images/mascot/Lev100/Geumyuk_100_1.png";
import lev100_img2 from "@/assets/images/mascot/Lev100/Geumyuk_100_2.png";
import lev100_img3 from "@/assets/images/mascot/Lev100/Geumyuk_100_3.png";
import lev100_img4 from "@/assets/images/mascot/Lev100/Geumyuk_100_4.png";
import lev100_img5 from "@/assets/images/mascot/Lev100/Geumyuk_100_5.png";

const props = defineProps({
  userName: { type: String, required: true },
  growthScore: { type: Number, required: true },
});

const displayStats = computed(
  () => `3대 ${Number(props.growthScore).toLocaleString()}kg`,
);

const imageSrc = computed(() => {
  const value = Number(props.growthScore) || 0;
  if (value <= 20) return lev100_img1;
  if (value <= 40) return lev100_img2;
  if (value <= 60) return lev100_img3;
  if (value <= 80) return lev100_img4;
  return lev100_img5;
});
</script>

<template>
  <div
    class="relative h-96 overflow-hidden rounded-3xl border border-gray-200 p-6"
  >
    <div class="absolute inset-x-0 bottom-0 top-24">
      <img
        src="@/assets/images/background/background1.png"
        alt="헬스장 배경"
        class="h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-black/30"></div>
    </div>

    <div class="relative z-10 mb-8 flex items-start justify-between">
      <div>
        <p class="mb-2 text-sm text-gray-300">{{ userName }}</p>
        <h1 class="text-2xl font-bold text-white">{{ displayStats }}</h1>
      </div>
    </div>

    <div
      class="top-35 absolute inset-x-6 bottom-20 z-10 flex items-center justify-center"
    >
      <img
        :src="imageSrc"
        alt="금육이 캐릭터"
        class="max-h-full max-w-full object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]"
      />
    </div>
  </div>
</template>
