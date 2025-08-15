<script setup>
import { computed } from "vue";

// 레벨별 배경 이미지
import background1 from "@/assets/images/background/background1.png";
import background2 from "@/assets/images/background/background2.png";
import background3 from "@/assets/images/background/background3.png";
import background4 from "@/assets/images/background/background4.png";
import background5 from "@/assets/images/background/background5.png";

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

  const finalIndex = Math.min(imageIndex, 24);
  const imagePath = `../../../assets/images/mascot/level/Geumyuk_${finalIndex + 1}.png`;
  return new URL(imagePath, import.meta.url).href;
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
