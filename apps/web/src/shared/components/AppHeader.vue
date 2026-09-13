<template>
  <v-card
    class="app-header-card mx-1 my-2"
    :class="isMobile ? 'pa-3' : 'pa-4'"
    elevation="0"
    rounded="lg"
  >
    <!-- Desktop Layout (> 768px) -->
    <div v-if="!isMobile" class="header-grid-desktop">
      <!-- Right (in RTL): Menu Drawer Toggle, Dark Mode Toggle & Status Chips -->
      <div
        class="header-section header-right d-flex align-center flex-wrap gap-2"
      >
        <v-btn
          icon
          size="small"
          variant="tonal"
          color="primary"
          class="ml-1 drawer-toggle-btn"
          @click="$emit('toggle-drawer')"
          aria-label="باز/بستن منوی فیلترها"
        >
          <v-icon size="20">mdi-filter-variant</v-icon>
        </v-btn>

        <v-btn
          icon
          size="small"
          variant="tonal"
          color="primary"
          class="ml-2 theme-toggle-btn"
          @click="toggleTheme"
          :aria-label="isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'"
          :title="isDark ? 'حالت روشن' : 'حالت تاریک'"
        >
          <v-icon size="20">{{
            isDark ? "mdi-weather-sunny" : "mdi-weather-night"
          }}</v-icon>
        </v-btn>

        <v-chip
          v-if="updateTimeDateText"
          color="primary"
          variant="flat"
          size="small"
          class="font-weight-medium"
        >
          <v-icon start size="16">mdi-calendar-sync</v-icon>
          {{ updateTimeDateText }}
        </v-chip>
        <v-chip
          v-if="updateTimeClockText"
          variant="tonal"
          size="small"
          color="secondary"
          class="mr-2"
        >
          <v-icon start size="16">mdi-clock-outline</v-icon>
          {{ updateTimeClockText }}
        </v-chip>
      </div>

      <!-- Center: Title & Academic Portal -->
      <div class="header-section header-center text-center">
        <h1 class="header-main-title">برنامه کلاسی هفتگی</h1>
        <span class="header-sub-badge"
          >دانشگاه شهرکرد — سامانه مدیریت آموزش (SESS)</span
        >
      </div>

      <!-- Left (in RTL): Version Pill -->
      <div
        class="header-section header-left d-flex align-center justify-end gap-2"
      >
        <a
          href="https://github.com/rashcode-com/Sess-Timetabling-App"
          target="_blank"
          rel="noopener noreferrer"
          class="github-pill"
          aria-label="View Reza Azad's project on GitHub"
        >
          <svg
            class="github-icon"
            viewBox="0 0 128 128"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M56.7937 84.9688C44.4187 83.4688 35.7 74.5625 35.7 63.0313C35.7 58.3438 37.3875 53.2813 40.2 49.9063C38.9812 46.8125 39.1687 40.25 40.575 37.5313C44.325 37.0625 49.3875 39.0313 52.3875 41.75C55.95 40.625 59.7 40.0625 64.2937 40.0625C68.8875 40.0625 72.6375 40.625 76.0125 41.6563C78.9187 39.0313 84.075 37.0625 87.825 37.5313C89.1375 40.0625 89.325 46.625 88.1062 49.8125C91.1062 53.375 92.7 58.1563 92.7 63.0313C92.7 74.5625 83.9812 83.2813 71.4187 84.875C74.6062 86.9375 76.7625 91.4375 76.7625 96.5938V106.344C76.7625 109.156 79.1062 110.75 81.9187 109.625C98.8875 103.156 112.2 86.1875 112.2 65.1875C112.2 38.6563 90.6375 17 64.1062 17C37.575 17 16.2 38.6562 16.2 65.1875C16.2 86 29.4187 103.25 47.2312 109.719C49.7625 110.656 52.2 108.969 52.2 106.438V98.9375C50.8875 99.5 49.2 99.875 47.7 99.875C41.5125 99.875 37.8562 96.5 35.2312 90.2188C34.2 87.6875 33.075 86.1875 30.9187 85.9063C29.7937 85.8125 29.4187 85.3438 29.4187 84.7813C29.4187 83.6563 31.2937 82.8125 33.1687 82.8125C35.8875 82.8125 38.2312 84.5 40.6687 87.9688C42.5437 90.6875 44.5125 91.9063 46.8562 91.9063C49.2 91.9063 50.7 91.0625 52.8562 88.9063C54.45 87.3125 55.6687 85.9063 56.7937 84.9688Z"
              fill="currentColor"
            />
          </svg>

          <span class="github-developer-name">Reza Azad</span>
        </a>

        <v-chip
          variant="outlined"
          size="small"
          color="primary"
          class="font-weight-medium"
        >
          {{ version }}
        </v-chip>
      </div>
    </div>

    <!-- Mobile Compact Layout (<= 768px) -->
    <div v-else class="header-mobile-wrapper d-flex flex-column gap-2">
      <!-- Row 1: Unified App Bar -->
      <div class="d-flex align-center justify-space-between w-100">
        <v-btn
          icon
          size="small"
          variant="tonal"
          color="primary"
          class="drawer-toggle-btn"
          @click="$emit('toggle-drawer')"
          aria-label="منوی فیلترها"
        >
          <v-icon size="20">mdi-filter-variant</v-icon>
        </v-btn>

        <div class="text-center px-2 flex-grow-1">
          <h1 class="header-main-title-mobile text-truncate">
            برنامه کلاسی هفتگی
          </h1>
          <span class="header-sub-badge-mobile text-truncate"
            >دانشگاه شهرکرد — سامانه آموزش (SESS)</span
          >
        </div>

        <v-btn
          icon
          size="small"
          variant="tonal"
          color="primary"
          class="theme-toggle-btn"
          @click="toggleTheme"
          :aria-label="isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'"
        >
          <v-icon size="20">{{
            isDark ? "mdi-weather-sunny" : "mdi-weather-night"
          }}</v-icon>
        </v-btn>
      </div>

      <!-- Row 2: Compact Sync Status & Version Pill -->
      <div
        class="d-flex align-center justify-center flex-wrap gap-2 pt-1 border-top-mobile"
      >
        <v-chip
          v-if="updateTimeDateText || updateTimeClockText"
          size="x-small"
          color="primary"
          variant="tonal"
          class="font-weight-medium"
        >
          <v-icon start size="13">mdi-calendar-sync</v-icon>
          <span>{{ updateTimeDateText }}</span>
          <span v-if="updateTimeClockText" class="mx-1">•</span>
          <span v-if="updateTimeClockText">{{ updateTimeClockText }}</span>
        </v-chip>

        <v-chip
          size="x-small"
          variant="outlined"
          color="secondary"
          class="font-weight-medium"
        >
          {{ version }}
        </v-chip>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTheme, useDisplay } from "vuetify";

interface Props {
  updateTimeDateText?: string;
  updateTimeClockText?: string;
  version?: string;
}

const {
  updateTimeDateText = "",
  updateTimeClockText = "",
  version = `نسخه ${typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.0"}`,
} = defineProps<Props>();

defineEmits<{
  (e: "toggle-drawer"): void;
}>();

const theme = useTheme();
const { smAndDown: isMobile } = useDisplay();
const isDark = computed(() => theme.global.current.value.dark);

const toggleTheme = (): void => {
  const next = isDark.value ? "light" : "dark";
  theme.global.name.value = next;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("sess-theme", next);
  }
};
</script>

<style scoped>
.app-header-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  box-shadow: var(--shadow-sm) !important;
}

.header-grid-desktop {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.header-right {
  justify-self: start;
}

.header-center {
  justify-self: center;
}

.header-left {
  justify-self: end;
}

.header-main-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
}

.header-sub-badge {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
  display: block;
  white-space: nowrap;
}

.header-main-title-mobile {
  font-size: 1.05rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0;
  line-height: 1.3;
}

.header-sub-badge-mobile {
  font-size: 0.72rem;
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
  display: block;
  line-height: 1.2;
}

.border-top-mobile {
  border-top: 1px dashed rgba(var(--v-theme-on-surface), 0.08);
}

.drawer-toggle-btn,
.theme-toggle-btn {
  border-radius: 8px;
  flex-shrink: 0;
}

/* Github Pill Styles */
.github-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;

  width: 38px;
  height: 38px;
  padding: 0 10px;

  border-radius: 999px;
  overflow: hidden;
  white-space: nowrap;

  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);

  text-decoration: none;
  cursor: pointer;

  transition:
    width 0.3s ease,
    gap 0.3s ease,
    box-shadow 0.3s ease;
}

.github-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  color: rgb(var(--v-theme-on-surface));
  transition: transform 0.3s ease;
}

.github-developer-name {
  max-width: 0;
  opacity: 0;
  overflow: hidden;

  font-size: 0.75rem;
  font-weight: 600;

  transition:
    max-width 0.3s ease,
    opacity 0.2s ease;
}

/* Expand on hover */
.github-pill:hover {
  width: 120px;
  gap: 8px;
  box-shadow: var(--shadow-sm);
}

.github-pill:hover .github-developer-name {
  max-width: 90px;
  opacity: 1;
}

.github-pill:hover .github-icon {
  transform: scale(1.1);
}
</style>
