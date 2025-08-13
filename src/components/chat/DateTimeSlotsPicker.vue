<script setup>
import { ref, computed, watch } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const props = defineProps({
  modelValueDate: { type: [Date, String, Number, null], default: null },
  modelValueTimes: { type: Array, default: () => [] },
  existingSchedules: { type: Array, default: () => [] },
  holidays: { type: Array, default: () => [] },
  morningTimes: {
    type: Array,
    default: () => ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  },
  afternoonTimes: {
    type: Array,
    default: () => ["13:00", "13:30", "14:00", "14:30", "15:00"],
  },
  extraAfternoonTimes: {
    type: Array,
    default: () => ["15:30", "16:00", "16:30", "17:00", "17:30"],
  },
  slotMinutes: { type: Number, default: 30 },
  locale: { type: String, default: "ko" },
  weekStart: { type: Number, default: 0 },
  classCard: { type: String, default: "rounded-[15px] p-4" },
});

const emit = defineEmits(["update:modelValueDate", "update:modelValueTimes"]);

const innerDate = ref(
  props.modelValueDate ? new Date(props.modelValueDate) : null,
);
const innerTimes = ref([...props.modelValueTimes]);

watch(
  () => props.modelValueDate,
  (v) => (innerDate.value = v ? new Date(v) : null),
);
watch(
  () => props.modelValueTimes,
  (v) => (innerTimes.value = [...v]),
);

const updateDate = (val) => {
  innerDate.value = val;
  innerTimes.value = innerTimes.value.filter((t) => !isTimeSlotTaken(val, t));
  emit("update:modelValueDate", val);
  emit("update:modelValueTimes", innerTimes.value);
};

const toggleTime = (time) => {
  if (!innerDate.value || isTimeSlotTaken(innerDate.value, time)) return;
  const i = innerTimes.value.indexOf(time);
  if (i > -1) innerTimes.value.splice(i, 1);
  else innerTimes.value.push(time);
  emit("update:modelValueTimes", innerTimes.value);
};

const holidaySet = computed(
  () => new Set(props.holidays.map((d) => new Date(d).toDateString())),
);
const isHoliday = (date) => holidaySet.value.has(new Date(date).toDateString());
const dayClass = (date) => {
  const d = new Date(date);
  const dow = d.getDay();
  if (isHoliday(d) || dow === 0) return "text-red-400 font-semibold";
  if (dow === 6) return "text-blue-400 font-semibold";
  return "";
};

function isTimeSlotTaken(date, time) {
  if (!date || !time) return false;
  const [hh, mm] = time.split(":").map(Number);
  const target = new Date(date);
  target.setHours(hh, mm, 0, 0);

  return props.existingSchedules.some((sch) => {
    let start;
    if (Array.isArray(sch.startTime)) {
      const [y, m, d, H, M] = sch.startTime;
      start = new Date(y, m - 1, d, H, M, 0, 0);
    } else if (typeof sch.startTime === "string") {
      start = new Date(sch.startTime.replace(" ", "T"));
    } else if (sch.startTime instanceof Date) {
      start = sch.startTime;
    }
    return start && start.getTime() === target.getTime();
  });
}

const TIME_BTN_WEIGHT = "font-medium";
const btnClass = (time) => {
  const taken = isTimeSlotTaken(innerDate.value, time);
  const selected = innerTimes.value.includes(time);
  const base = `w-full h-[33px] rounded-[15px] border text-[12px] ${TIME_BTN_WEIGHT} transition-all`;
  if (taken)
    return `${base} border-gray-600 bg-gray-600 text-gray-400 cursor-not-allowed`;
  return selected
    ? `${base} border-primary bg-primary bg-opacity-20 text-white`
    : `${base} border-white bg-gray-custom text-white hover:border-primary hover:bg-primary hover:bg-opacity-10`;
};
</script>

<template>
  <div class="mb-6" :class="classCard">
    <VueDatePicker
      :model-value="innerDate"
      :dark="true"
      inline
      auto-apply
      :week-start="weekStart"
      :enable-time-picker="false"
      :hide-offset-dates="true"
      :day-class="dayClass"
      :locale="locale"
      @update:model-value="updateDate"
    />
  </div>

  <div :class="classCard">
    <div class="mb-6">
      <h3 class="mb-3 text-[12px] text-gray-50">오전</h3>
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="t in morningTimes"
          :key="t"
          :class="btnClass(t)"
          @click="toggleTime(t)"
          :disabled="isTimeSlotTaken(innerDate, t)"
        >
          {{ t }}
        </button>
      </div>
    </div>

    <div>
      <h3 class="mb-3 text-[12px] text-gray-50">오후</h3>
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="t in afternoonTimes"
          :key="t"
          :class="btnClass(t)"
          @click="toggleTime(t)"
          :disabled="isTimeSlotTaken(innerDate, t)"
        >
          {{ t }}
        </button>
      </div>
      <div class="mt-2 grid grid-cols-5 gap-2">
        <button
          v-for="t in extraAfternoonTimes"
          :key="t"
          :class="btnClass(t)"
          @click="toggleTime(t)"
          :disabled="isTimeSlotTaken(innerDate, t)"
        >
          {{ t }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.dp__theme_dark) {
  --dp-background-color: transparent;
  --dp-text-color: #ffffff;
  --dp-hover-color: #22e481;
  --dp-hover-text-color: #111111;
  --dp-primary-color: #22e481;
  --dp-primary-text-color: #111111;
  --dp-border-color: transparent;
}
:deep(.dp__overlay) {
  --dp-background-color: rgba(17, 17, 17, 0.96);
  --dp-border-color: rgba(255, 255, 255, 0.08);
  background-color: rgba(17, 17, 17, 0.96) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
  z-index: 50;
}
:deep(.dp__overlay_header),
:deep(.dp__overlay_col),
:deep(.dp__overlay_row) {
  color: #fff;
}
:deep(.dp__overlay_cell_active),
:deep(.dp__overlay_cell_active:hover) {
  background: #22e481 !important;
  color: #111 !important;
}
:deep(.dp__cell_offset .dp__cell_inner) {
  opacity: 0.45 !important;
  filter: saturate(0.7) !important;
}
:deep(.dp__overlay_action),
:deep(.dp__overlay .dp__action_row) {
  display: none !important;
}
</style>
