<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="56rem"
  >
    <v-card class="clash-modal-card" rounded="lg">
      <!-- Header Banner -->
      <v-card-title class="clash-header pa-4 text-white d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <v-icon color="white" size="24" class="ml-2">mdi-alert-octagon</v-icon>
          <h2 class="text-h6 font-weight-bold mb-0">گزارش تداخل دروس</h2>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          color="white"
          @click="$emit('update:modelValue', false)"
          aria-label="بستن گزارش تداخل"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- 1. Class Time Conflicts -->
        <div v-if="classTimeConflicts && classTimeConflicts.length !== 0" class="mb-4">
          <div class="d-flex align-center mb-3">
            <v-icon color="error" size="20" class="ml-1">mdi-clock-alert-outline</v-icon>
            <h3 class="section-title text-error mb-0">تداخل ساعت کلاسی</h3>
          </div>

          <v-card
            v-for="(pair, index) in classTimeConflicts"
            :key="'class-' + (pair[0].id || index) + '-' + (pair[1].id || index)"
            class="clash-pair-card mb-3 pa-3"
            variant="outlined"
          >
            <v-row align="center">
              <!-- Course A -->
              <v-col cols="12" md="6" class="text-center pa-2 border-left-md">
                <div class="course-name font-weight-bold text-primary mb-2">
                  {{ pair[0].title }}
                </div>

                <!-- Exact Conflicting Session in Red Chip -->
                <div class="d-flex flex-column align-center gap-1 mb-2">
                  <v-chip
                    v-for="(slotText, sIdx) in getConflictAnalysis(pair[0], pair[1]).clashing1"
                    :key="'c1-clash-' + sIdx"
                    color="error"
                    variant="flat"
                    size="small"
                    class="font-weight-bold text-wrap py-1"
                  >
                    <v-icon start size="14">mdi-clock-alert-outline</v-icon>
                    زمان متداخل: {{ slotText }}
                  </v-chip>
                </div>

                <!-- Other Safe Sessions -->
                <div
                  v-if="getConflictAnalysis(pair[0], pair[1]).other1.length"
                  class="other-sessions text-caption mb-2 text-medium-emphasis"
                >
                  <span class="font-weight-medium text-high-emphasis">سایر کلاس‌ها: </span>
                  <span>{{ getConflictAnalysis(pair[0], pair[1]).other1.join(" • ") }}</span>
                </div>

                <div class="text-caption text-medium-emphasis">
                  استاد: {{ pair[0].teacher }}
                </div>
              </v-col>

              <!-- Course B -->
              <v-col cols="12" md="6" class="text-center pa-2">
                <div class="course-name font-weight-bold text-primary mb-2">
                  {{ pair[1].title }}
                </div>

                <!-- Exact Conflicting Session in Red Chip -->
                <div class="d-flex flex-column align-center gap-1 mb-2">
                  <v-chip
                    v-for="(slotText, sIdx) in getConflictAnalysis(pair[0], pair[1]).clashing2"
                    :key="'c2-clash-' + sIdx"
                    color="error"
                    variant="flat"
                    size="small"
                    class="font-weight-bold text-wrap py-1"
                  >
                    <v-icon start size="14">mdi-clock-alert-outline</v-icon>
                    زمان متداخل: {{ slotText }}
                  </v-chip>
                </div>

                <!-- Other Safe Sessions -->
                <div
                  v-if="getConflictAnalysis(pair[0], pair[1]).other2.length"
                  class="other-sessions text-caption mb-2 text-medium-emphasis"
                >
                  <span class="font-weight-medium text-high-emphasis">سایر کلاس‌ها: </span>
                  <span>{{ getConflictAnalysis(pair[0], pair[1]).other2.join(" • ") }}</span>
                </div>

                <div class="text-caption text-medium-emphasis">
                  استاد: {{ pair[1].teacher }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </div>

        <!-- 2. Final Exam Conflicts -->
        <div v-if="finalExamConflicts && finalExamConflicts.length !== 0">
          <div class="d-flex align-center mb-3">
            <v-icon color="error" size="20" class="ml-1">mdi-calendar-alert</v-icon>
            <h3 class="section-title text-error mb-0">تداخل ساعت امتحان نهایی</h3>
          </div>

          <v-card
            v-for="(pair, index) in finalExamConflicts"
            :key="'final-' + (pair[0].id || index) + '-' + (pair[1].id || index)"
            class="clash-pair-card mb-3 pa-3"
            variant="outlined"
          >
            <v-row align="center">
              <!-- Course A -->
              <v-col cols="12" md="6" class="text-center pa-2 border-left-md">
                <div class="course-name font-weight-bold text-primary mb-1">
                  {{ pair[0].title }}
                </div>
                <v-chip color="error" variant="flat" size="small" class="mb-1 font-weight-bold">
                  <span>{{ pair[0].final_date }} — ساعت </span>
                  <span dir="ltr">{{ toFarsiNumber(pair[0].final_time) }}</span>
                </v-chip>
                <div class="text-caption text-medium-emphasis">
                  استاد: {{ pair[0].teacher }}
                </div>
              </v-col>

              <!-- Course B -->
              <v-col cols="12" md="6" class="text-center pa-2">
                <div class="course-name font-weight-bold text-primary mb-1">
                  {{ pair[1].title }}
                </div>
                <v-chip color="error" variant="flat" size="small" class="mb-1 font-weight-bold">
                  <span>{{ pair[1].final_date }} — ساعت </span>
                  <span dir="ltr">{{ toFarsiNumber(pair[1].final_time) }}</span>
                </v-chip>
                <div class="text-caption text-medium-emphasis">
                  استاد: {{ pair[1].teacher }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Harmonious Action Row without Empty Gap -->
      <v-card-actions class="pa-3 justify-end">
        <v-btn
          color="secondary"
          variant="tonal"
          rounded="sm"
          class="font-weight-medium px-4"
          @click="$emit('update:modelValue', false)"
        >
          بستن
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { toFarsiNumber } from "@sess/core";
import { normalizeDayName } from "@shared";
import type { Course, CourseConflictPair, TimeSlot } from "@/types";

interface Props {
  modelValue?: boolean;
  classTimeConflicts?: CourseConflictPair[];
  finalExamConflicts?: CourseConflictPair[];
}

const {
  modelValue = false,
  classTimeConflicts = [],
  finalExamConflicts = [],
} = defineProps<Props>();

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const formatSlot = (slot: TimeSlot): string => {
  const hStart = toFarsiNumber(String(slot.startHour).padStart(2, "0"));
  const mStart = toFarsiNumber(String(slot.startMinute || 0).padStart(2, "0"));
  const hEnd = toFarsiNumber(String(slot.endHour).padStart(2, "0"));
  const mEnd = toFarsiNumber(String(slot.endMinute || 0).padStart(2, "0"));
  return `${slot.day} ${hStart}:${mStart} تا ${hEnd}:${mEnd}`;
};

interface ConflictAnalysis {
  clashing1: string[];
  clashing2: string[];
  other1: string[];
  other2: string[];
}

const getConflictAnalysis = (course1: Course, course2: Course): ConflictAnalysis => {
  const slots1: TimeSlot[] = course1.seperated_time_and_place || [];
  const slots2: TimeSlot[] = course2.seperated_time_and_place || [];

  const clashIndices1 = new Set<number>();
  const clashIndices2 = new Set<number>();

  for (let i = 0; i < slots1.length; i++) {
    const s1 = slots1[i];
    const day1 = normalizeDayName(s1.day);
    const start1 = (s1.startHour || 0) * 60 + (s1.startMinute || 0);
    const end1 = (s1.endHour || 0) * 60 + (s1.endMinute || 0);

    for (let j = 0; j < slots2.length; j++) {
      const s2 = slots2[j];
      const day2 = normalizeDayName(s2.day);
      if (day1 !== day2) continue;

      const start2 = (s2.startHour || 0) * 60 + (s2.startMinute || 0);
      const end2 = (s2.endHour || 0) * 60 + (s2.endMinute || 0);

      // Check strict overlap
      if (!(start1 >= end2 || end1 <= start2)) {
        clashIndices1.add(i);
        clashIndices2.add(j);
      }
    }
  }

  const clashing1: string[] = [];
  const other1: string[] = [];
  slots1.forEach((s, idx) => {
    const formatted = formatSlot(s) + (s.place ? ` (${s.place})` : "");
    if (clashIndices1.has(idx)) {
      clashing1.push(formatted);
    } else {
      other1.push(formatted);
    }
  });

  const clashing2: string[] = [];
  const other2: string[] = [];
  slots2.forEach((s, idx) => {
    const formatted = formatSlot(s) + (s.place ? ` (${s.place})` : "");
    if (clashIndices2.has(idx)) {
      clashing2.push(formatted);
    } else {
      other2.push(formatted);
    }
  });

  return {
    clashing1: clashing1.length ? clashing1 : [course1.time_room || ""],
    clashing2: clashing2.length ? clashing2 : [course2.time_room || ""],
    other1,
    other2,
  };
};
</script>

<style scoped>
.clash-modal-card {
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.clash-header {
  background: var(--gradient-clash);
}

.section-title {
  font-size: 1.05rem;
  font-weight: 600;
}

.clash-pair-card {
  background-color: rgb(var(--v-theme-surface-light));
  border-color: rgba(var(--v-theme-error), 0.25) !important;
  border-radius: 8px;
}

@media (min-width: 960px) {
  .border-left-md {
    border-left: 1px dashed rgba(var(--v-theme-on-surface), 0.15);
  }
}

.course-name {
  font-size: 0.95rem;
}

.other-sessions {
  line-height: 1.6;
}
</style>
