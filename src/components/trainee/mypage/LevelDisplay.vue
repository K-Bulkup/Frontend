<script setup>
import { computed } from "vue";

// 레벨별 배경 이미지
import background1 from "@/assets/images/background/background1.png";
import background2 from "@/assets/images/background/background2.png";
import background3 from "@/assets/images/background/background3.png";
import background4 from "@/assets/images/background/background4.png";
import background5 from "@/assets/images/background/background5.png";

// 레벨별 캐릭터 이미지
import lev1_img from "@/assets/images/mascot/Lev100/Geumyuk_100_1.png";
import lev2_img from "@/assets/images/mascot/Lev100/Geumyuk_100_2.png";
import lev3_img from "@/assets/images/mascot/Lev100/Geumyuk_100_3.png";
import lev4_img from "@/assets/images/mascot/Lev100/Geumyuk_100_4.png";
import lev5_img from "@/assets/images/mascot/Lev100/Geumyuk_100_5.png";

const props = defineProps({
  growthScore: { type: Number, required: true },
});

// growthScore에 따른 배경 이미지 결정
const backgroundImage = computed(() => {
  if (props.growthScore < 100) return background1;
  if (props.growthScore < 200) return background2;
  if (props.growthScore < 300) return background3;
  if (props.growthScore < 400) return background4;
  return background5;
});

// growthScore에 따른 캐릭터 이미지 결정
const characterImage = computed(() => {
  if (props.growthScore <= 20) return lev1_img;
  if (props.growthScore <= 40) return lev2_img;
  if (props.growthScore <= 60) return lev3_img;
  if (props.growthScore <= 80) return lev4_img;
  return lev5_img;
});
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden">
    <img
      :src="backgroundImage"
      alt="레벨 배경화면"
      class="absolute inset-0 h-full w-full object-cover"
    />

    <div
      class="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-start justify-center"
    >
      <img
        :src="characterImage"
        alt="금육이 캐릭터"
        class="max-h-[500px] drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
      />
    </div>

    <div class="relative z-20">
      <slot></slot>
    </div>
  </div>
</template>
