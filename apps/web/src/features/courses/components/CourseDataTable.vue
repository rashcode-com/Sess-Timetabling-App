<template>
  <div class="course-data-table-wrapper">
    <!-- Desktop Table View (> 768px) -->
    <v-card v-if="!mobileDevice" class="app-table-card" rounded="lg" elevation="0">
      <v-data-table
        :headers="headers"
        :items="results"
        :items-per-page="itemsPerPage"
        v-model="selectedIds"
        v-model:expanded="expanded"
        v-model:page="page"
        show-select
        show-expand
        item-value="id"
        density="comfortable"
        hover
        class="app-data-table"
        hide-default-footer
      >
        <!-- Custom Formatting for Course Title -->
        <template #item.title="{ item }">
          <span class="font-weight-bold text-body-2 course-title-cell">{{ item.title }}</span>
        </template>

        <!-- Custom Formatting for Instructor -->
        <template #item.teacher="{ item }">
          <span class="text-body-2">{{ item.teacher }}</span>
        </template>

        <!-- Custom Formatting for Group -->
        <template #item.group="{ item }">
          <v-chip size="x-small" variant="tonal" color="secondary" class="font-weight-medium">
            گروه {{ toFarsiNumber(item.group) }}
          </v-chip>
        </template>

        <!-- Clean Pill/Badge Formatting for Time & Room Column -->
        <template #item.time_room="{ item }">
          <div
            v-if="item.seperated_time_and_place && item.seperated_time_and_place.length"
            class="time-room-slots d-flex flex-column gap-1 py-1"
          >
            <div
              v-for="(slot, idx) in item.seperated_time_and_place"
              :key="idx"
              class="slot-pill d-flex align-center gap-1"
            >
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-medium slot-day-chip">
                {{ slot.day }}
              </v-chip>
              <span dir="ltr" class="slot-time text-caption font-weight-medium">
                {{ formatSlotTime(slot.startHour, slot.startMinute) }} - {{ formatSlotTime(slot.endHour, slot.endMinute) }}
              </span>
              <span v-if="slot.place" class="slot-place text-caption text-medium-emphasis">
                ({{ slot.place }})
              </span>
            </div>
          </div>
          <span v-else class="text-caption text-medium-emphasis">{{ item.time_room }}</span>
        </template>

        <!-- Structured Expanded Row -->
        <template #expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="pa-0">
              <div class="expanded-detail-box pa-4 ma-2 rounded-lg">
                <!-- Top Summary Row -->
                <div class="d-flex align-start justify-space-between mb-3 pb-2 border-bottom">
                  <div class="d-flex align-start">
                    <v-avatar color="primary" variant="tonal" size="32" class="flex-shrink-0 mt-n1 ml-2">
                      <v-icon color="primary" size="18">mdi-book-open-page-variant-outline</v-icon>
                    </v-avatar>
                    <div>
                      <h3 class="expanded-title mb-0 line-height-tight">{{ item.title }}</h3>
                      <span class="text-caption text-medium-emphasis">{{ item.unit }}</span>
                    </div>
                  </div>
                  <div class="d-flex align-center gap-2">
                    <v-chip v-if="item.capacity" color="info" variant="tonal" size="small">
                      ظرفیت: {{ toFarsiNumber(item.capacity) }} نفر
                    </v-chip>
                    <v-chip color="primary" variant="flat" size="small" class="font-weight-bold">
                      {{ toFarsiNumber(item.vahed) }} واحد
                    </v-chip>
                  </div>
                </div>

                <!-- Structured 4-Column Specification Grid -->
                <v-row class="specs-grid" dense>
                  <v-col cols="12" sm="6" md="3" class="py-1">
                    <div class="spec-card pa-2 rounded">
                      <div class="spec-label">
                        <v-icon size="14" class="ml-1" color="primary">mdi-account-tie-outline</v-icon>
                        استاد:
                      </div>
                      <div class="spec-val font-weight-medium">{{ item.teacher }}</div>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6" md="3" class="py-1">
                    <div class="spec-card pa-2 rounded">
                      <div class="spec-label">
                        <v-icon size="14" class="ml-1" color="secondary">mdi-account-group-outline</v-icon>
                        گروه / جنسیت:
                      </div>
                      <div class="spec-val">گروه {{ toFarsiNumber(item.group) }} ({{ item.gender || "مختلط" }})</div>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6" md="3" class="py-1">
                    <div class="spec-card pa-2 rounded">
                      <div class="spec-label">
                        <v-icon size="14" class="ml-1" color="error">mdi-calendar-alert</v-icon>
                        امتحان نهایی:
                      </div>
                      <div class="spec-val text-error font-weight-medium">
                        {{ item.final_date || "نامشخص" }}
                        <span v-if="item.final_time">(<span dir="ltr">{{ toFarsiNumber(item.final_time) }}</span>)</span>
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6" md="3" class="py-1">
                    <div class="spec-card pa-2 rounded">
                      <div class="spec-label">
                        <v-icon size="14" class="ml-1" color="info">mdi-clock-outline</v-icon>
                        ساعت در هفته:
                      </div>
                      <div class="spec-val">{{ toFarsiNumber(item.time_in_week) || "—" }} ساعت</div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <!-- Mobile Card View (<= 768px) -->
    <div v-else class="course-mobile-card-list d-flex flex-column gap-3">
      <v-card
        v-for="item in paginatedResults"
        :key="item.id"
        class="mobile-course-card rounded-lg pa-3"
        :class="{ 'mobile-course-card--selected': isSelected(item.id) }"
        elevation="0"
      >
        <!-- Top Row: Checkbox, Course Title, Chips & Info Action -->
        <div class="card-header-row d-flex align-start justify-space-between w-100 mb-2">
          <!-- Right Side (in RTL): Checkbox + Title + Chips -->
          <div class="d-flex align-start gap-2 flex-grow-1 min-w-0">
            <v-checkbox-btn
              :model-value="isSelected(item.id)"
              color="primary"
              density="compact"
              class="mobile-card-checkbox flex-shrink-0"
              @click.stop="toggleSelection(item)"
              aria-label="انتخاب درس"
            />
            <div class="course-title-block d-flex flex-column align-start text-start flex-grow-1 min-w-0">
              <span
                class="course-card-title font-weight-bold text-body-1"
                @click="emit('show-detail', item)"
              >
                {{ item.title }}
              </span>
              <!-- Badges: Group, Units, Capacity -->
              <div class="course-chips-row d-flex align-center flex-wrap gap-1 mt-1">
                <v-chip size="x-small" variant="tonal" color="secondary" class="font-weight-medium">
                  گروه {{ toFarsiNumber(item.group) }}
                </v-chip>
                <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-bold">
                  {{ toFarsiNumber(item.vahed) }} واحد
                </v-chip>
                <v-chip v-if="item.capacity" size="x-small" variant="tonal" color="info">
                  ظرفیت: {{ toFarsiNumber(item.capacity) }}
                </v-chip>
              </div>
            </div>
          </div>

          <!-- Left Side (in RTL): Info Trigger Button -->
          <v-btn
            icon="mdi-information-outline"
            variant="tonal"
            size="x-small"
            color="primary"
            class="flex-shrink-0 mr-1 mt-1"
            aria-label="مشاهده مشخصات کامل"
            @click="emit('show-detail', item)"
          />
        </div>

        <!-- Instructor with Icon -->
        <div class="instructor-row d-flex align-center gap-2 text-start mt-2 pr-1">
          <v-icon size="16" color="primary" class="flex-shrink-0">mdi-account-tie-outline</v-icon>
          <span class="instructor-name font-weight-medium text-body-2">{{ item.teacher }}</span>
          <span v-if="item.gender" class="text-caption text-medium-emphasis">({{ item.gender }})</span>
        </div>

        <!-- Time & Room Slots -->
        <div
          v-if="item.seperated_time_and_place && item.seperated_time_and_place.length"
          class="mobile-slot-list d-flex flex-column gap-1 mt-2 pt-2 border-top-mobile-card"
        >
          <div
            v-for="(slot, idx) in item.seperated_time_and_place"
            :key="idx"
            class="mobile-slot-pill d-flex align-center justify-space-between px-2 py-1 rounded"
          >
            <div class="d-flex align-center gap-2">
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-medium slot-day-chip">
                {{ slot.day }}
              </v-chip>
              <span dir="ltr" class="slot-time text-caption font-weight-medium">
                {{ formatSlotTime(slot.startHour, slot.startMinute) }} - {{ formatSlotTime(slot.endHour, slot.endMinute) }}
              </span>
            </div>
            <span v-if="slot.place" class="slot-place text-caption text-medium-emphasis">
              ({{ slot.place }})
            </span>
          </div>
        </div>
        <div v-else-if="item.time_room" class="text-caption text-medium-emphasis text-right mt-2 pt-1 border-top-mobile-card">
          {{ item.time_room }}
        </div>

        <!-- Exam Date & Detail Trigger Footer -->
        <div v-if="item.final_date" class="exam-footer-row d-flex align-center justify-space-between mt-2 pt-2 border-top-mobile-card text-caption">
          <span class="text-error d-flex align-center gap-1 font-weight-medium">
            <v-icon size="14" color="error">mdi-calendar-alert</v-icon>
            امتحان: {{ item.final_date }}
            <span v-if="item.final_time">(<span dir="ltr">{{ toFarsiNumber(item.final_time) }}</span>)</span>
          </span>
          <v-btn
            variant="text"
            size="x-small"
            color="primary"
            class="px-1 font-weight-bold detail-cta-btn"
            @click="emit('show-detail', item)"
          >
            مشاهده جزئیات
            <v-icon size="14" class="mr-1">mdi-chevron-left</v-icon>
          </v-btn>
        </div>
      </v-card>
    </div>

    <!-- Table / Card Pagination -->
    <div v-if="pageCount > 1" class="d-flex justify-center pt-4 pb-8">
      <v-pagination
        v-model="page"
        :length="pageCount"
        color="primary"
        density="comfortable"
        rounded="circle"
        :total-visible="mobileDevice ? 4 : 7"
      ></v-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { toFarsiNumber } from "@sess/core";
import type { Course } from "@/types";

export interface DataTableHeader {
  title: string;
  key: string;
  sortable?: boolean;
  width?: string;
  align?: "start" | "center" | "end";
}

interface Props {
  results: Course[];
  modelValue?: Course[];
  headers?: DataTableHeader[];
  itemsPerPage?: number;
  mobileDevice?: boolean;
}

const {
  results,
  modelValue = [],
  headers = [
    { title: "درس", key: "title", sortable: true },
    { title: "استاد", key: "teacher", sortable: true },
    { title: "گروه", key: "group", sortable: true, width: "100px" },
    { title: "زمان و مکان کلاس", key: "time_room", sortable: false },
  ],
  itemsPerPage = 10,
  mobileDevice = false,
} = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Course[]): void;
  (e: "show-detail", item: Course): void;
}>();

const expanded = ref<string[]>([]);
const page = ref<number>(1);

// Reset page to 1 when results change
watch(
  () => results,
  () => {
    page.value = 1;
  }
);

const formatSlotTime = (h: number, m?: number): string => {
  const hStr = toFarsiNumber(String(h).padStart(2, "0"));
  const mStr = toFarsiNumber(String(m || 0).padStart(2, "0"));
  return `${hStr}:${mStr}`;
};

// Two-way synchronization between v-data-table IDs and full course objects
const selectedIds = computed<string[]>({
  get() {
    return (modelValue || [])
      .map((item) => (item && typeof item === "object" ? item.id : item))
      .filter((id): id is string => Boolean(id));
  },
  set(newIds: string[]) {
    const courseMap = new Map<string, Course>();
    (results || []).forEach((c) => {
      if (c && c.id) courseMap.set(c.id, c);
    });
    (modelValue || []).forEach((c) => {
      if (c && c.id) courseMap.set(c.id, c);
    });

    const newSelectedObjects: Course[] = newIds
      .map((id) => courseMap.get(id))
      .filter((c): c is Course => Boolean(c));

    emit("update:modelValue", newSelectedObjects);
  },
});

const isSelected = (id?: string): boolean => {
  if (!id) return false;
  return selectedIds.value.includes(id);
};

const toggleSelection = (item: Course): void => {
  if (!item || !item.id) return;
  const current = new Set(selectedIds.value);
  if (current.has(item.id)) {
    current.delete(item.id);
  } else {
    current.add(item.id);
  }
  selectedIds.value = Array.from(current);
};

const pageCount = computed<number>(() => {
  if (!results || results.length === 0) return 0;
  return Math.ceil(results.length / itemsPerPage);
});

const paginatedResults = computed<Course[]>(() => {
  if (!mobileDevice) return results || [];
  const start = (page.value - 1) * itemsPerPage;
  return (results || []).slice(start, start + itemsPerPage);
});
</script>

<style scoped>
.app-table-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgb(var(--v-theme-surface));
  box-shadow: var(--shadow-sm) !important;
  overflow: hidden;
}

:deep(.v-data-table__th) {
  background-color: rgb(var(--v-theme-surface-bright)) !important;
  color: rgba(var(--v-theme-on-surface), 0.85) !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12) !important;
  white-space: nowrap;
}

:deep(.v-data-table__td) {
  font-size: 0.875rem !important;
  color: rgba(var(--v-theme-on-surface), 0.92) !important;
  vertical-align: middle !important;
}

:deep(.v-data-table__tr:hover:not(.v-data-table__expanded__content)) {
  background-color: rgba(var(--v-theme-primary), 0.06) !important;
}

.course-title-cell {
  color: rgb(var(--v-theme-primary));
}

.slot-pill {
  background-color: rgb(var(--v-theme-background));
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-flex;
}

.slot-day-chip {
  font-size: 0.6875rem !important;
}

.expanded-detail-box {
  background-color: rgb(var(--v-theme-surface-light));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.border-bottom {
  border-bottom: 1px dashed rgba(var(--v-theme-on-surface), 0.15);
}

.expanded-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.line-height-tight {
  line-height: 1.35 !important;
}

.spec-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.spec-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-weight: 500;
  margin-bottom: 2px;
}

.spec-val {
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

/* Mobile Card View Styles */
.mobile-course-card {
  text-align: right !important;
  direction: rtl !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgb(var(--v-theme-surface));
  box-shadow: var(--shadow-sm) !important;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.15s ease;
}

.mobile-course-card--selected {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.3) !important;
}

.mobile-card-checkbox {
  margin-top: -6px;
  margin-right: -4px;
}

.course-title-block {
  text-align: right !important;
  direction: rtl !important;
  align-items: flex-start !important;
  width: 100% !important;
}

.course-card-title {
  display: block !important;
  width: 100% !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-size: 1rem !important;
  font-weight: 700 !important;
  text-align: right !important;
  direction: rtl !important;
  line-height: 1.4 !important;
  cursor: pointer;
}

.course-card-title:hover {
  text-decoration: underline;
}

.course-chips-row {
  display: flex !important;
  justify-content: flex-start !important;
  align-items: center !important;
  width: 100% !important;
  direction: rtl !important;
}

.instructor-row {
  display: flex !important;
  justify-content: flex-start !important;
  align-items: center !important;
  width: 100% !important;
  text-align: right !important;
  direction: rtl !important;
}

.instructor-name {
  color: rgba(var(--v-theme-on-surface), 0.92);
}

.cursor-pointer {
  cursor: pointer;
}

.mobile-slot-pill {
  background-color: rgb(var(--v-theme-background)) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  padding: 3px 8px;
}

.border-top-mobile-card {
  border-top: 1px dashed rgba(var(--v-theme-on-surface), 0.1);
}

.min-w-0 {
  min-width: 0;
}

.detail-cta-btn {
  letter-spacing: normal !important;
}
</style>
