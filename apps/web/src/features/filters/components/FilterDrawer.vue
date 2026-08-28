<template>
  <v-navigation-drawer
    location="right"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :temporary="temporary"
    :width="drawerWidth"
    class="filter-drawer"
    elevation="0"
  >
    <template #prepend>
      <!-- Dedicated Drawer Header Bar aligned with AppHeader height -->
      <div class="drawer-header-bar px-2">
        <v-tabs
          v-model="activeTab"
          color="primary"
          density="compact"
          :show-arrows="false"
          grow
          class="filter-tabs"
        >
          <v-tab value="filter" class="tab-item">
            <v-icon start size="16">mdi-filter-variant</v-icon>
            فیلترها
          </v-tab>
          <v-tab value="selected" class="tab-item">
            <v-badge
              v-if="selectedCount > 0"
              :content="toFarsiNumber(selectedCount)"
              color="primary"
              inline
              class="ml-1 font-weight-bold"
            ></v-badge>
            <v-icon start size="16">mdi-format-list-checks</v-icon>
            انتخاب‌شده‌ها
          </v-tab>
        </v-tabs>
      </div>
      <v-divider></v-divider>
    </template>

    <!-- 1. Filter Tab Content -->
    <div v-show="activeTab === 'filter'" class="px-3 pb-4 pt-4">
      <v-autocomplete
        label="نیمسال تحصیلی *"
        v-model="localFilters.semester"
        :items="semesters"
        :error-messages="semesterError"
        :menu-props="autocompleteMenuProps"
        variant="outlined"
        density="comfortable"
        color="primary"
        hide-details="auto"
        class="mb-3 custom-form-field"
        clearable
      ></v-autocomplete>

      <v-autocomplete
        label="بخش"
        v-model="localFilters.unit"
        :items="units"
        :menu-props="autocompleteMenuProps"
        multiple
        chips
        closable-chips
        variant="outlined"
        density="comfortable"
        color="primary"
        hide-details="auto"
        class="mb-3 custom-form-field"
        clearable
      ></v-autocomplete>

      <v-autocomplete
        label="درس"
        v-model="localFilters.course"
        :items="courses"
        :menu-props="autocompleteMenuProps"
        multiple
        chips
        closable-chips
        variant="outlined"
        density="comfortable"
        color="primary"
        hide-details="auto"
        class="mb-3 custom-form-field"
        clearable
      ></v-autocomplete>

      <v-autocomplete
        label="نام استاد"
        v-model="localFilters.teacherName"
        :items="teachers"
        :menu-props="autocompleteMenuProps"
        multiple
        chips
        closable-chips
        variant="outlined"
        density="comfortable"
        color="primary"
        hide-details="auto"
        class="mb-3 custom-form-field"
        clearable
      ></v-autocomplete>

      <v-autocomplete
        label="جنسیت"
        v-model="localFilters.gender"
        :items="genders"
        :menu-props="autocompleteMenuProps"
        multiple
        chips
        closable-chips
        variant="outlined"
        density="comfortable"
        color="primary"
        hide-details="auto"
        class="mb-3 custom-form-field"
        clearable
      ></v-autocomplete>

      <v-autocomplete
        label="مکان برگزاری کلاس"
        v-model="localFilters.place"
        :items="places"
        :menu-props="autocompleteMenuProps"
        multiple
        chips
        closable-chips
        variant="outlined"
        density="comfortable"
        color="primary"
        hide-details="auto"
        class="mb-3 custom-form-field"
        clearable
      ></v-autocomplete>

      <!-- Interactive Clock Time Pickers with Balanced RTL Append Icons -->
      <v-row no-gutters class="mb-3">
        <!-- Start Time -->
        <v-col cols="6" class="pl-1">
          <v-menu v-model="startMenu" :close-on-content-click="false" location="bottom end">
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model="localTimeStart"
                label="از ساعت"
                append-inner-icon="mdi-clock-time-four-outline"
                variant="outlined"
                density="comfortable"
                color="primary"
                hide-details="auto"
                class="custom-form-field cursor-pointer"
                readonly
                clearable
                @click:clear="localTimeStart = ''"
              ></v-text-field>
            </template>
            <v-card class="pa-2 time-picker-card" rounded="lg" elevation="3">
              <v-time-picker
                v-model="rawTimeStart"
                format="24hr"
                color="primary"
                @update:model-value="onTimeStartSelected"
              ></v-time-picker>
              <div class="quick-slots d-flex flex-wrap gap-1 mt-2 justify-center">
                <v-chip
                  v-for="slot in ['۰۸:۰۰', '۱۰:۰۰', '۱۲:۰۰', '۱۴:۰۰', '۱۶:۰۰']"
                  :key="slot"
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  class="cursor-pointer"
                  @click="setTimeStartDirect(slot)"
                >
                  {{ slot }}
                </v-chip>
              </div>
            </v-card>
          </v-menu>
        </v-col>

        <!-- End Time -->
        <v-col cols="6" class="pr-1">
          <v-menu v-model="endMenu" :close-on-content-click="false" location="bottom end">
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model="localTimeEnd"
                label="تا ساعت"
                append-inner-icon="mdi-clock-time-eight-outline"
                variant="outlined"
                density="comfortable"
                color="primary"
                hide-details="auto"
                class="custom-form-field cursor-pointer"
                readonly
                clearable
                @click:clear="localTimeEnd = ''"
              ></v-text-field>
            </template>
            <v-card class="pa-2 time-picker-card" rounded="lg" elevation="3">
              <v-time-picker
                v-model="rawTimeEnd"
                format="24hr"
                color="primary"
                @update:model-value="onTimeEndSelected"
              ></v-time-picker>
              <div class="quick-slots d-flex flex-wrap gap-1 mt-2 justify-center">
                <v-chip
                  v-for="slot in ['۱۰:۰۰', '۱۲:۰۰', '۱۴:۰۰', '۱۶:۰۰', '۱۸:۰۰']"
                  :key="slot"
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  class="cursor-pointer"
                  @click="setTimeEndDirect(slot)"
                >
                  {{ slot }}
                </v-chip>
              </div>
            </v-card>
          </v-menu>
        </v-col>
      </v-row>

      <!-- Inline Validation Warning Banner -->
      <v-expand-transition>
        <v-alert
          v-if="filterSelectionError"
          type="warning"
          variant="tonal"
          density="compact"
          rounded="md"
          class="mb-3 text-caption font-weight-medium"
        >
          {{ filterSelectionError }}
        </v-alert>
      </v-expand-transition>

      <!-- High-Impact Gradient Search CTA Button -->
      <v-btn
        block
        size="large"
        class="btn-app-primary mt-2"
        @click="handleSearch"
      >
        <v-icon start size="20">mdi-magnify</v-icon>
        <span class="font-weight-bold">جستجو</span>
      </v-btn>
    </div>

    <!-- 2. Selected Courses Tab Content -->
    <div v-show="activeTab === 'selected'" class="px-2 pb-4 pt-4">
      <slot name="selected-courses"></slot>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import { useDisplay } from "vuetify";
import { toFarsiNumber } from "@sess/core";
import type { SearchEventPayload } from "@/types";

const { xs } = useDisplay();
const drawerWidth = computed<number>(() =>
  xs.value ? Math.min(300, (typeof window !== "undefined" ? window.innerWidth : 350) - 16) : 350
);

interface Props {
  modelValue?: boolean;
  semesters?: string[];
  units?: string[];
  courses?: string[];
  teachers?: string[];
  places?: string[];
  genders?: string[];
  selectedCount?: number;
  temporary?: boolean;
}

const {
  modelValue = true,
  semesters = [],
  units = [],
  courses = [],
  teachers = [],
  places = [],
  genders = [],
  selectedCount = 0,
  temporary = false,
} = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "tab-change", tab: string): void;
  (e: "search", payload: SearchEventPayload): void;
}>();

// Single reactive source of truth for tabs
const activeTab = ref<string>("filter");
const localTimeStart = ref<string>("");
const localTimeEnd = ref<string>("");
const rawTimeStart = ref<string | null>(null);
const rawTimeEnd = ref<string | null>(null);
const startMenu = ref<boolean>(false);
const endMenu = ref<boolean>(false);

// Inline Validation Error State
const semesterError = ref<string>("");
const filterSelectionError = ref<string>("");

const autocompleteMenuProps = {
  maxWidth: 420,
  minWidth: 326,
  contentClass: "app-autocomplete-menu",
};

interface LocalFiltersState {
  semester: string;
  unit: string[];
  course: string[];
  teacherName: string[];
  place: string[];
  gender: string[];
}

const localFilters = reactive<LocalFiltersState>({
  semester: "",
  unit: [],
  course: [],
  teacherName: [],
  place: [],
  gender: [],
});

watch(
  () => semesters,
  (newSemesters) => {
    if (newSemesters && newSemesters.length && !localFilters.semester) {
      localFilters.semester = newSemesters[0];
    }
  },
  { immediate: true }
);

watch(
  () => activeTab.value,
  (newTab) => {
    emit("tab-change", newTab);
  }
);

// Clear errors when fields are edited
watch(
  () => localFilters.semester,
  (val) => {
    if (val) semesterError.value = "";
  }
);

watch(
  () => [
    localFilters.unit.length,
    localFilters.course.length,
    localFilters.teacherName.length,
  ],
  () => {
    if (
      localFilters.unit.length ||
      localFilters.course.length ||
      localFilters.teacherName.length
    ) {
      filterSelectionError.value = "";
    }
  }
);

// Time conversion helpers
const toStandardTime = (str?: string): string => {
  if (!str) return "";
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[۰-۹]/g, (w) => String(persianDigits.indexOf(w)));
};

const onTimeStartSelected = (val: string | null): void => {
  if (val) {
    localTimeStart.value = toFarsiNumber(val);
    startMenu.value = false;
  }
};

const onTimeEndSelected = (val: string | null): void => {
  if (val) {
    localTimeEnd.value = toFarsiNumber(val);
    endMenu.value = false;
  }
};

const setTimeStartDirect = (slot: string): void => {
  localTimeStart.value = slot;
  startMenu.value = false;
};

const setTimeEndDirect = (slot: string): void => {
  localTimeEnd.value = slot;
  endMenu.value = false;
};

const handleSearch = (): void => {
  let hasError = false;

  if (!localFilters.semester) {
    semesterError.value = "نیمسال تحصیلی باید انتخاب شود";
    hasError = true;
  }

  if (
    !localFilters.unit.length &&
    !localFilters.course.length &&
    !localFilters.teacherName.length
  ) {
    filterSelectionError.value =
      "حداقل یکی از موارد بخش، درس یا نام استاد باید انتخاب شود.";
    hasError = true;
  }

  if (hasError) {
    return;
  }

  semesterError.value = "";
  filterSelectionError.value = "";

  emit("search", {
    filters: {
      semester: localFilters.semester,
      unit: [...localFilters.unit],
      course: [...localFilters.course],
      teacherName: [...localFilters.teacherName],
      place: [...localFilters.place],
      gender: [...localFilters.gender],
    },
    timeRange: {
      timeStart: toStandardTime(localTimeStart.value),
      timeEnd: toStandardTime(localTimeEnd.value),
    },
  });
};
</script>

<style scoped>
.filter-drawer {
  background-color: rgb(var(--v-theme-surface)) !important;
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
  box-shadow: -2px 0 12px 0 rgba(var(--v-theme-on-surface), 0.04) !important;
}

.drawer-header-bar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-tabs {
  min-width: 0 !important;
  width: 100% !important;
}

:deep(.v-slide-group__prev),
:deep(.v-slide-group__next) {
  display: none !important;
}

.tab-item {
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
  min-width: 0 !important;
  padding: 0 8px !important;
}

.time-picker-card {
  max-width: 320px;
  background-color: rgb(var(--v-theme-surface));
}

.cursor-pointer :deep(input) {
  cursor: pointer !important;
}
</style>
