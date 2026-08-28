<template>
  <div v-if="selectedList && selectedList.length" class="weekly-calendar-wrapper mb-6">
    <!-- Toggle Header Banner -->
    <v-card
      class="calendar-toggle-banner pa-3 d-flex align-center justify-space-between cursor-pointer"
      rounded="lg"
      elevation="0"
      @click="toggleCalendar"
    >
      <div class="d-flex align-center gap-2">
        <v-avatar color="primary" variant="tonal" size="36" class="ml-2">
          <v-icon color="primary" size="20">mdi-calendar-clock</v-icon>
        </v-avatar>
        <div>
          <span class="font-weight-bold text-subtitle-1">برنامه هفتگی کلاسی</span>
          <v-chip color="primary" variant="tonal" size="x-small" class="font-weight-bold mr-2">
            {{ toFarsiNumber(selectedList.length) }} درس انتخاب شده
          </v-chip>
        </div>
      </div>

      <div class="d-flex align-center">
        <span class="text-body-2 text-primary font-weight-medium ml-2">
          {{ calendarOpen ? 'بستن تقویم' : 'نمایش تقویم' }}
        </span>
        <v-icon
          color="primary"
          class="toggle-chevron"
          :class="{ 'rotate-180': calendarOpen }"
        >
          mdi-chevron-down
        </v-icon>
      </div>
    </v-card>

    <!-- Expandable Weekly Calendar Sheet (Open by default) -->
    <v-expand-transition>
      <div v-if="calendarOpen" class="mt-3">
        <v-card class="calendar-grid-card pa-3" rounded="lg" elevation="0">
          <!-- Scrollable Grid Container -->
          <div class="calendar-scroll-box">
            <div class="calendar-matrix" :style="{ height: (MATRIX_HEIGHT + 40) + 'px' }">
              <!-- Time Column (Right edge in RTL) -->
              <div class="time-column">
                <div class="day-header-cell empty-header">ساعت</div>
                <div class="time-labels-track" :style="{ height: MATRIX_HEIGHT + 'px' }">
                  <div
                    v-for="(label, idx) in timeLabels"
                    :key="label"
                    class="time-slot-label"
                    :style="{ top: (idx * HOUR_HEIGHT + 4) + 'px' }"
                  >
                    <span>{{ label }}</span>
                  </div>
                </div>
              </div>

              <!-- Days Columns (Saturday to Friday) -->
              <div
                v-for="day in iranianDays"
                :key="day.id"
                class="day-column"
              >
                <!-- Day Header -->
                <div class="day-header-cell">
                  <span class="font-weight-bold">{{ day.name }}</span>
                </div>

                <!-- Day Slots Content & Side-by-Side Placed Events -->
                <div class="day-content-track" :style="{ height: MATRIX_HEIGHT + 'px' }">
                  <!-- Horizontal Hour Divider Lines -->
                  <div
                    v-for="h in HOURS_COUNT"
                    :key="h"
                    class="hour-divider-line"
                    :style="{ top: ((h - 1) * HOUR_HEIGHT) + 'px' }"
                  ></div>

                  <!-- Course Event Blocks with Floating Tooltip & Multi-line Titles -->
                  <template
                    v-for="event in getEventsForDay(day.id)"
                    :key="event.id"
                  >
                    <v-tooltip
                      location="top"
                      :open-delay="120"
                      content-class="calendar-tooltip-card"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <div
                          v-bind="tooltipProps"
                          class="calendar-event-card"
                          :style="getEventStyle(event)"
                          @click="openEventModal(event)"
                        >
                          <div class="event-title font-weight-bold">
                            {{ event.name }}
                          </div>
                          <div class="event-meta text-truncate">
                            {{ event.teacher }}
                          </div>
                          <div v-if="event.room" class="event-room text-truncate">
                            {{ event.room }}
                          </div>
                        </div>
                      </template>
                      <div class="calendar-tooltip-body text-right">
                        <div class="d-flex align-center gap-1 mb-1">
                          <span
                            class="tooltip-badge-dot ml-1"
                            :style="{ backgroundColor: event.rawColor || '#B085FF' }"
                          ></span>
                          <span class="font-weight-bold text-subtitle-2 text-white">
                            {{ event.name }}
                          </span>
                        </div>
                        <div class="tooltip-detail-row text-caption mb-1">
                          <v-icon size="13" class="ml-1 opacity-80">mdi-account-tie-outline</v-icon>
                          <span>{{ event.teacher }} (گروه {{ toFarsiNumber(event.group) }})</span>
                        </div>
                        <div class="tooltip-detail-row tooltip-time text-caption font-weight-medium mb-1">
                          <v-icon size="13" class="ml-1 text-primary">mdi-clock-outline</v-icon>
                          <span>{{ event.timeText }}</span>
                        </div>
                        <div v-if="event.room" class="tooltip-detail-row text-caption">
                          <v-icon size="13" class="ml-1 opacity-70">mdi-map-marker-outline</v-icon>
                          <span>{{ event.room }}</span>
                        </div>
                      </div>
                    </v-tooltip>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </v-expand-transition>

    <!-- Event Details Popover Modal with Persian Formatting -->
    <v-dialog v-model="selectedOpen" max-width="440px">
      <v-card class="event-dialog-card" rounded="lg">
        <v-card-title
          class="pa-4 text-white d-flex align-center justify-space-between"
          :style="{ backgroundColor: selectedEvent.rawColor || '#8C57FF' }"
        >
          <div class="d-flex align-center gap-2">
            <v-icon color="white" size="20" class="ml-2">mdi-book-outline</v-icon>
            <span class="font-weight-bold text-subtitle-1">{{ selectedEvent.name }}</span>
          </div>
          <v-btn icon variant="text" size="small" color="white"
            @click="selectedOpen = false"
            aria-label="بستن جزئیات درس">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-list density="compact" class="pa-0">
            <v-list-item class="px-0 py-1">
              <template #prepend>
                <span class="font-weight-bold text-caption text-medium-emphasis ml-2">استاد:</span>
              </template>
              <span class="text-body-2 font-weight-medium">{{ selectedEvent.teacher }}</span>
            </v-list-item>

            <v-list-item class="px-0 py-1">
              <template #prepend>
                <span class="font-weight-bold text-caption text-medium-emphasis ml-2">شماره گروه:</span>
              </template>
              <span class="text-body-2">گروه {{ toFarsiNumber(selectedEvent.group) }}</span>
            </v-list-item>

            <v-list-item v-if="selectedEvent.room" class="px-0 py-1">
              <template #prepend>
                <span class="font-weight-bold text-caption text-medium-emphasis ml-2">مکان کلاس:</span>
              </template>
              <span class="text-body-2">{{ selectedEvent.room }}</span>
            </v-list-item>

            <v-list-item class="px-0 py-1">
              <template #prepend>
                <span class="font-weight-bold text-caption text-medium-emphasis ml-2">زمان کلاس:</span>
              </template>
              <span class="text-body-2 font-weight-medium text-primary">{{ selectedEvent.timeText }}</span>
            </v-list-item>

            <v-list-item v-if="selectedEvent.final_date" class="px-0 py-1">
              <template #prepend>
                <span class="font-weight-bold text-caption text-medium-emphasis ml-2">امتحان نهایی:</span>
              </template>
              <v-chip color="error" variant="tonal" size="x-small" class="font-weight-bold">
                <span>{{ selectedEvent.final_date }}</span>
                <span v-if="selectedEvent.final_time" class="mr-1">(ساعت <span dir="ltr">{{ toFarsiNumber(selectedEvent.final_time) }}</span>)</span>
              </v-chip>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-3 justify-end">
          <v-btn
            color="primary"
            variant="flat"
            rounded="sm"
            @click="selectedOpen = false"
          >
            بستن
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { toFarsiNumber } from "@sess/core";
import { normalizeDayName } from "@shared";

const props = defineProps({
  selectedList: {
    type: Array,
    default: () => [],
  },
  mobileDevice: {
    type: Boolean,
    default: false,
  },
});

const calendarOpen = ref(true);
const selectedOpen = ref(false);
const selectedEvent = ref({});

const iranianDays = [
  { id: "شنبه", name: "شنبه" },
  { id: "یک‌شنبه", name: "یک‌شنبه" },
  { id: "دوشنبه", name: "دوشنبه" },
  { id: "سه‌شنبه", name: "سه‌شنبه" },
  { id: "چهارشنبه", name: "چهارشنبه" },
  { id: "پنج‌شنبه", name: "پنج‌شنبه" },
  { id: "جمعه", name: "جمعه" },
];

const START_HOUR = 7;
const END_HOUR = 20;
const HOURS_COUNT = END_HOUR - START_HOUR; // 13 intervals
const HOUR_HEIGHT = 48; // Explicit pixel height per hour
const MATRIX_HEIGHT = HOURS_COUNT * HOUR_HEIGHT; // 624px

const timeLabels = [
  "۰۷:۰۰", "۰۸:۰۰", "۰۹:۰۰", "۱۰:۰۰", "۱۱:۰۰", "۱۲:۰۰",
  "۱۳:۰۰", "۱۴:۰۰", "۱۵:۰۰", "۱۶:۰۰", "۱۷:۰۰", "۱۸:۰۰", "۱۹:۰۰", "۲۰:۰۰"
];

const paletteColors = [
  "#8C57FF", "#16B1FF", "#56CA00", "#FFB400", "#FF4C51",
  "#00ADB5", "#F08A5D", "#B83B5E", "#6A2C70", "#3282B8", "#17B978"
];

const toggleCalendar = () => {
  calendarOpen.value = !calendarOpen.value;
};

const formatTimePersian = (h, m) => {
  const hStr = toFarsiNumber(String(h).padStart(2, "0"));
  const mStr = toFarsiNumber(String(m || 0).padStart(2, "0"));
  return `${hStr}:${mStr}`;
};

// Bug 1 & 4 Fix: Accurate Connected-Component Clustering & Symmetrical Interval Partitioning
const dayEventsMap = computed(() => {
  const map = new Map();
  iranianDays.forEach((d) => map.set(d.id, []));

  // Deduplicate courses from props.selectedList
  const courses = [];
  const seenCourseIds = new Set();
  (props.selectedList || []).forEach((c) => {
    if (c && c.id && !seenCourseIds.has(c.id)) {
      seenCourseIds.add(c.id);
      courses.push(c);
    }
  });

  const rawList = [];

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    if (!course || typeof course !== "object" || !course.seperated_time_and_place) continue;

    const baseColor = paletteColors[i % paletteColors.length];

    // Deduplicate slots for this course so duplicate records in data don't render twice
    const seenSlots = new Set();

    for (let j = 0; j < course.seperated_time_and_place.length; j++) {
      const slot = course.seperated_time_and_place[j];
      const day = normalizeDayName(slot.day);
      const slotKey = `${day}-${slot.startHour}:${slot.startMinute}-${slot.endHour}:${slot.endMinute}`;
      if (seenSlots.has(slotKey)) continue;
      seenSlots.add(slotKey);

      const startMin = (slot.startHour - START_HOUR) * 60 + (slot.startMinute || 0);
      const endMin = (slot.endHour - START_HOUR) * 60 + (slot.endMinute || 0);
      const durationMin = Math.max(endMin - startMin, 40);

      rawList.push({
        id: `${course.id}-${j}`,
        name: course.title,
        teacher: course.teacher,
        group: course.group,
        day,
        room: slot.place,
        final_date: course.final_date,
        final_time: course.final_time,
        rawColor: baseColor,
        startMin,
        endMin,
        durationMin,
        timeText: `${formatTimePersian(slot.startHour, slot.startMinute)} تا ${formatTimePersian(slot.endHour, slot.endMinute)}`,
      });
    }
  }

  // Process sub-column splitting per day
  iranianDays.forEach((d) => {
    const dayEvents = rawList.filter((e) => e.day === d.id);
    if (!dayEvents.length) return;

    // Sort by start time, then duration descending
    dayEvents.sort((a, b) => a.startMin - b.startMin || b.durationMin - a.durationMin);

    // Two events overlap if and only if they strictly overlap in time
    const overlaps = (a, b) => !(a.startMin >= b.endMin || a.endMin <= b.startMin);

    // Find connected components (clusters) of mutually overlapping events
    const clusters = [];
    dayEvents.forEach((ev) => {
      const matchingClusterIndices = [];
      clusters.forEach((cl, idx) => {
        if (cl.some((c) => overlaps(ev, c))) {
          matchingClusterIndices.push(idx);
        }
      });

      if (matchingClusterIndices.length === 0) {
        // No overlaps with any existing cluster -> independent cluster
        clusters.push([ev]);
      } else if (matchingClusterIndices.length === 1) {
        // Overlaps with exactly one cluster
        clusters[matchingClusterIndices[0]].push(ev);
      } else {
        // Bridges multiple clusters -> merge them
        const merged = [ev];
        for (let k = matchingClusterIndices.length - 1; k >= 0; k--) {
          merged.push(...clusters.splice(matchingClusterIndices[k], 1)[0]);
        }
        clusters.push(merged);
      }
    });

    // Layout each cluster independently:
    clusters.forEach((cluster) => {
      cluster.sort((a, b) => a.startMin - b.startMin || b.durationMin - a.durationMin);

      // Pack into columns greedily
      const columns = [];
      cluster.forEach((ev) => {
        let placed = false;
        for (let colIdx = 0; !placed; colIdx++) {
          const colEvents = columns[colIdx] || [];
          const hasClash = colEvents.some((c) => overlaps(ev, c));
          if (!hasClash) {
            if (!columns[colIdx]) columns[colIdx] = [];
            columns[colIdx].push(ev);
            ev.colIndex = colIdx;
            placed = true;
          }
        }
      });

      const totalCols = columns.length;
      cluster.forEach((ev) => {
        ev.totalCols = totalCols;
        ev.widthPercent = 100 / totalCols;
        ev.rightPercent = ev.colIndex * ev.widthPercent;
      });
    });

    map.set(d.id, dayEvents);
  });

  return map;
});

const getEventsForDay = (dayId) => {
  return dayEventsMap.value.get(dayId) || [];
};

const getEventStyle = (event) => {
  const topPx = (event.startMin / 60) * HOUR_HEIGHT;
  const heightPx = Math.max(44, (event.durationMin / 60) * HOUR_HEIGHT - 2);

  return {
    top: `${topPx}px`,
    height: `${heightPx}px`,
    width: `calc(${event.widthPercent}% - 4px)`,
    right: `calc(${event.rightPercent}% + 2px)`,
    borderRight: `4px solid ${event.rawColor}`,
    backgroundColor: `${event.rawColor}1F`, // 12% opacity tint
  };
};

const openEventModal = (event) => {
  selectedEvent.value = event;
  selectedOpen.value = true;
};
</script>

<style scoped>
.weekly-calendar-wrapper {
  width: 100%;
}

.calendar-toggle-banner {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  box-shadow: var(--shadow-sm) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-toggle-banner:hover {
  border-color: rgb(var(--v-theme-primary));
}

.toggle-chevron {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.rotate-180 {
  transform: rotate(180deg);
}

.calendar-grid-card {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  box-shadow: var(--shadow-sm) !important;
}

.calendar-scroll-box {
  overflow-x: auto;
  scrollbar-width: thin;
  width: 100%;
}

.calendar-matrix {
  display: flex;
  min-width: 680px;
  position: relative;
}

.time-column {
  width: 58px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.time-labels-track {
  position: relative;
}

.day-column {
  flex: 1;
  min-width: 88px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  position: relative;
}

.day-column:last-child {
  border-left: none;
}

.day-header-cell {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(var(--v-theme-surface-bright));
  font-size: 0.8125rem;
  color: rgba(var(--v-theme-on-surface), 0.85);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  position: sticky;
  top: 0;
  z-index: 5;
}

.empty-header {
  background-color: rgb(var(--v-theme-surface-bright));
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.time-slot-label {
  position: absolute;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.day-content-track {
  position: relative;
  background-color: rgb(var(--v-theme-surface));
}

.hour-divider-line {
  position: absolute;
  left: 0;
  right: 0;
  border-bottom: 1px dashed rgba(var(--v-theme-on-surface), 0.08);
}

/* Fix Bug 1 & Bug 4: Sub-column and Event Card Styling with Multi-Line Text */
.calendar-event-card {
  position: absolute;
  border-radius: 6px;
  padding: 4px 6px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(var(--v-theme-on-surface), 0.1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
  box-sizing: border-box;
}

.calendar-event-card:hover {
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 4px 14px rgba(var(--v-theme-on-surface), 0.25);
  z-index: 15;
}

.event-title {
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.25;
  color: rgba(var(--v-theme-on-surface), 0.98);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.event-meta {
  font-size: 0.65rem;
  color: rgba(var(--v-theme-on-surface), 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.event-room {
  font-size: 0.6rem;
  color: rgba(var(--v-theme-on-surface), 0.72);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-dialog-card {
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}
</style>
