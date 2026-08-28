<template>
  <v-card class="app-header-card mx-1 my-2 pa-4" elevation="0" rounded="lg">
    <div class="header-grid">
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

        <v-chip color="primary" variant="flat" size="small" class="font-weight-medium">
          <v-icon start size="16">mdi-calendar-sync</v-icon>
          {{ updateTimeDateText }}
        </v-chip>
        <v-chip variant="tonal" size="small" color="secondary" class="mr-2">
          <v-icon start size="16">mdi-clock-outline</v-icon>
          {{ updateTimeClockText }}
        </v-chip>
      </div>

      <!-- Center: Title & Academic Portal (Guaranteed 50% Mathematical Center) -->
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
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { useTheme } from "vuetify";

defineProps({
  updateTimeDateText: {
    type: String,
    default: "به روز شده در ۹ شهریور",
  },
  updateTimeClockText: {
    type: String,
    default: "ساعت ۱۱:۱۸",
  },
  version: {
    type: String,
    default: `نسخه ${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.1.5'}`,
  },
});

defineEmits(["toggle-drawer"]);

const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);

const toggleTheme = () => {
  const next = isDark.value ? 'light' : 'dark';
  theme.global.name.value = next;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('sess-theme', next);
  }
};
</script>

<style scoped>
.app-header-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  box-shadow: var(--shadow-sm) !important;
}

.header-grid {
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

@media (max-width: 768px) {
  .header-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .header-right,
  .header-center,
  .header-left {
    justify-content: center;
    width: 100%;
  }
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

.drawer-toggle-btn,
.theme-toggle-btn {
  border-radius: 8px;
}
</style>
