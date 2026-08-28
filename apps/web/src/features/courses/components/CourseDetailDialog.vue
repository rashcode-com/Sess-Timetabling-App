<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="540px"
  >
    <v-card v-if="course" class="course-detail-card" rounded="lg">
      <!-- Modal Header -->
      <v-card-title class="dialog-header d-flex align-center justify-space-between pa-4">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="36" class="ml-2">
            <v-icon color="primary" size="20">mdi-book-open-page-variant</v-icon>
          </v-avatar>
          <div>
            <span class="font-weight-bold text-h6 dialog-title">{{ course.title }}</span>
            <v-chip color="primary" variant="flat" size="x-small" class="font-weight-bold mr-2">
              {{ course.vahed }} واحد
            </v-chip>
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="$emit('update:modelValue', false)"
          aria-label="بستن مشخصات درس"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Fix Bug 20, 21, 22: Structured Key-Value Specification Grid -->
      <v-card-text class="pa-4">
        <div class="spec-table rounded overflow-hidden">
          <div class="spec-row d-flex">
            <div class="spec-key">بخش دانشکده</div>
            <div class="spec-val">{{ course.unit || "—" }}</div>
          </div>

          <div class="spec-row d-flex">
            <div class="spec-key">استاد درس</div>
            <div class="spec-val font-weight-medium">{{ course.teacher || "—" }}</div>
          </div>

          <div class="spec-row d-flex">
            <div class="spec-key">شماره گروه</div>
            <div class="spec-val">گروه {{ course.group || "—" }}</div>
          </div>

          <div class="spec-row d-flex">
            <div class="spec-key">جنسیت پذیرش</div>
            <div class="spec-val">{{ course.gender || "مختلط" }}</div>
          </div>

          <div class="spec-row d-flex">
            <div class="spec-key">امتحان نهایی</div>
            <div class="spec-val">
              <v-chip
                v-if="course.final_date"
                color="error"
                variant="tonal"
                size="small"
                class="font-weight-bold"
              >
                <span>{{ course.final_date }}</span>
                <span v-if="course.final_time" class="mr-1">(ساعت <span dir="ltr">{{ toFarsiNumber(course.final_time) }}</span>)</span>
              </v-chip>
              <span v-else class="text-medium-emphasis">نامشخص</span>
            </div>
          </div>

          <div class="spec-row d-flex">
            <div class="spec-key">زمان و مکان کلاس</div>
            <div class="spec-val">
              <div
                v-if="course.seperated_time_and_place && course.seperated_time_and_place.length"
                class="d-flex flex-column gap-1 py-1"
              >
                <div
                  v-for="(slot, idx) in course.seperated_time_and_place"
                  :key="idx"
                  class="d-flex align-center gap-1"
                >
                  <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-medium">
                    {{ slot.day }}
                  </v-chip>
                  <span dir="ltr" class="text-caption font-weight-medium">
                    {{ formatSlotTime(slot.startHour, slot.startMinute) }} - {{ formatSlotTime(slot.endHour, slot.endMinute) }}
                  </span>
                  <span v-if="slot.place" class="text-caption text-medium-emphasis">
                    ({{ slot.place }})
                  </span>
                </div>
              </div>
              <span v-else class="text-medium-emphasis">{{ course.time_room || "—" }}</span>
            </div>
          </div>

          <div class="spec-row d-flex">
            <div class="spec-key">ظرفیت کل</div>
            <div class="spec-val">{{ course.capacity || "—" }} نفر</div>
          </div>

          <div class="spec-row d-flex">
            <div class="spec-key">ساعت در هفته</div>
            <div class="spec-val">{{ course.time_in_week || "—" }} ساعت</div>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Symmetrical Modal Actions -->
      <v-card-actions class="pa-3 justify-end">
        <v-btn
          color="primary"
          variant="flat"
          rounded="sm"
          class="px-5"
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
import type { Course } from "@/types";

interface Props {
  modelValue?: boolean;
  course?: Partial<Course> | null;
}

const {
  modelValue = false,
  course = null,
} = defineProps<Props>();

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const formatSlotTime = (h: number, m?: number): string => {
  const hStr = toFarsiNumber(String(h).padStart(2, "0"));
  const mStr = toFarsiNumber(String(m || 0).padStart(2, "0"));
  return `${hStr}:${mStr}`;
};
</script>

<style scoped>
.course-detail-card {
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background-color: rgb(var(--v-theme-surface));
}

.dialog-header {
  background-color: rgb(var(--v-theme-surface-bright));
}

.dialog-title {
  color: rgba(var(--v-theme-on-surface), 0.9);
  font-size: 1.1rem;
}

.spec-table {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.spec-row {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.spec-row:last-child {
  border-bottom: none;
}

.spec-row:nth-child(even) {
  background-color: rgb(var(--v-theme-surface-light));
}

.spec-key {
  width: 38%;
  padding: 10px 12px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  background-color: rgba(var(--v-theme-background), 0.5);
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.spec-val {
  width: 62%;
  padding: 10px 12px;
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
  display: flex;
  align-items: center;
}
</style>
