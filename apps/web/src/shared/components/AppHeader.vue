<template>
  <v-card class="app-header-card mx-1 my-2" :class="isMobile ? 'pa-3' : 'pa-4'" elevation="0" rounded="lg">
    <!-- Desktop Layout (> 768px) -->
    <div v-if="!isMobile" class="header-grid-desktop">
      <!-- Right (in RTL): Menu Drawer Toggle, Dark Mode Toggle & Status Chips -->
      <div class="header-section header-right d-flex align-center flex-wrap gap-2">
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
          <v-icon size="20">{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
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
        <span class="header-sub-badge">دانشگاه شهرکرد — سامانه مدیریت آموزش (SESS)</span>
      </div>

      <!-- Left (in RTL): Version Pill -->
      <div class="header-section header-left d-flex align-center justify-end">
        <v-chip variant="outlined" size="small" color="primary" class="font-weight-medium">
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
          <h1 class="header-main-title-mobile text-truncate">برنامه کلاسی هفتگی</h1>
          <span class="header-sub-badge-mobile text-truncate">دانشگاه شهرکرد — سامانه آموزش (SESS)</span>
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
          <v-icon size="20">{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>
      </div>

      <!-- Row 2: Compact Sync Status & Version Pill -->
      <div class="d-flex align-center justify-center flex-wrap gap-2 pt-1 border-top-mobile">
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
</style>
