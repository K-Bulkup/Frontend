<script setup>
import { computed } from "vue";

// 레벨별 배경 이미지
import background1 from "@/assets/images/background/background1.png";
import background2 from "@/assets/images/background/background2.png";
import background3 from "@/assets/images/background/background3.png";
import background4 from "@/assets/images/background/background4.png";
import background5 from "@/assets/images/background/background5.png";

// 레벨별 금육이 이미지
import Geumyuk1 from "@/assets/images/mascot/level/Geumyuk_1.png";
import Geumyuk2 from "@/assets/images/mascot/level/Geumyuk_2.png";
import Geumyuk3 from "@/assets/images/mascot/level/Geumyuk_3.png";
import Geumyuk4 from "@/assets/images/mascot/level/Geumyuk_4.png";
import Geumyuk5 from "@/assets/images/mascot/level/Geumyuk_5.png";
import Geumyuk6 from "@/assets/images/mascot/level/Geumyuk_6.png";
import Geumyuk7 from "@/assets/images/mascot/level/Geumyuk_7.png";
import Geumyuk8 from "@/assets/images/mascot/level/Geumyuk_8.png";
import Geumyuk9 from "@/assets/images/mascot/level/Geumyuk_9.png";
import Geumyuk10 from "@/assets/images/mascot/level/Geumyuk_10.png";
import Geumyuk11 from "@/assets/images/mascot/level/Geumyuk_11.png";
import Geumyuk12 from "@/assets/images/mascot/level/Geumyuk_12.png";
import Geumyuk13 from "@/assets/images/mascot/level/Geumyuk_13.png";
import Geumyuk14 from "@/assets/images/mascot/level/Geumyuk_14.png";
import Geumyuk15 from "@/assets/images/mascot/level/Geumyuk_15.png";
import Geumyuk16 from "@/assets/images/mascot/level/Geumyuk_16.png";
import Geumyuk17 from "@/assets/images/mascot/level/Geumyuk_17.png";
import Geumyuk18 from "@/assets/images/mascot/level/Geumyuk_18.png";
import Geumyuk19 from "@/assets/images/mascot/level/Geumyuk_19.png";
import Geumyuk20 from "@/assets/images/mascot/level/Geumyuk_20.png";
import Geumyuk21 from "@/assets/images/mascot/level/Geumyuk_21.png";
import Geumyuk22 from "@/assets/images/mascot/level/Geumyuk_22.png";
import Geumyuk23 from "@/assets/images/mascot/level/Geumyuk_23.png";
import Geumyuk24 from "@/assets/images/mascot/level/Geumyuk_24.png";
import Geumyuk25 from "@/assets/images/mascot/level/Geumyuk_25.png";

const characterImages = [
  Geumyuk1,
  Geumyuk2,
  Geumyuk3,
  Geumyuk4,
  Geumyuk5,
  Geumyuk6,
  Geumyuk7,
  Geumyuk8,
  Geumyuk9,
  Geumyuk10,
  Geumyuk11,
  Geumyuk12,
  Geumyuk13,
  Geumyuk14,
  Geumyuk15,
  Geumyuk16,
  Geumyuk17,
  Geumyuk18,
  Geumyuk19,
  Geumyuk20,
  Geumyuk21,
  Geumyuk22,
  Geumyuk23,
  Geumyuk24,
  Geumyuk25,
];

const props = defineProps({
  growthScore: { type: Number, required: true },
  applyBackdropBlur: { type: Boolean, default: false },
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
  const imageIndex = Math.floor(props.growthScore / 20);
  const finalIndex = Math.min(imageIndex, characterImages.length - 1);
  return characterImages[finalIndex];
});
</script>

<template>
  <div
    :class="[
      'relative w-full overflow-hidden',
      { 'bg-black/10 backdrop-blur-sm': applyBackdropBlur },
    ]"
  >
    <img
      :src="backgroundImage"
      alt="레벨 배경화면"
      class="absolute inset-0 h-full w-full object-cover"
    />

    <!-- 반투명 레이어 -->
    <div class="absolute inset-0 bg-black/20"></div>

    <div
      class="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-start justify-center"
    >
      <img
        :src="characterImage"
        alt="금육이 캐릭터"
        class="max-h-[300px] drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
      />
    </div>

    <div
      class="relative z-20 flex h-screen flex-col justify-between overflow-y-hidden p-6 pb-24"
    >
      <slot></slot>
    </div>
  </div>
</template>
