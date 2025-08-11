<script setup>
import { computed } from "vue";

const props = defineProps({
  /** 필수: 이미지 모듈(import 결과) */
  src: { type: String, required: true },

  /** 위치/크기 */
  bottom: { type: [Number, String], default: -32 }, // px
  width: { type: [Number, String], default: 420 }, // px (모바일)
  mdWidth: { type: [Number, String], default: 520 }, // px (>=768px)

  /** 톤 조절 (필요 없으면 기본값 유지) */
  opacity: { type: Number, default: 1 }, // 0~1
  brightness: { type: Number, default: 1 }, // 0.0~1.0~2.0
  contrast: { type: Number, default: 1 }, // 0.0~1.0~2.0
});

const imgStyle = computed(() => {
  const toPx = (v) => (typeof v === "number" ? `${v}px` : v);
  return {
    bottom: toPx(props.bottom),
    width: toPx(props.width),
    filter: `brightness(${props.brightness}) contrast(${props.contrast}) opacity(${props.opacity})`,
    // md 폭은 CSS 변수로 처리
    "--mdw": toPx(props.mdWidth),
  };
});
</script>

<template>
  <img
    :src="src"
    alt=""
    class="pointer-events-none absolute left-1/2 max-w-none -translate-x-1/2 select-none md:[width:var(--mdw)]"
    :style="imgStyle"
  />
</template>

<style scoped>
/* md 이상에서 width를 CSS 변수로 교체 */
@media (min-width: 768px) {
  img {
    width: var(--mdw);
  }
}
</style>
