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

    <!-- Clear all active filters -->
    <div class="d-flex justify-end mt-2" style="min-height: 28px">
      <v-btn
        v-if="showClearFilters && activeTab === 'filter'"
        variant="text"
        size="small"
        color="error"
        :disabled="loading"
        @click="handleClearFilters"
      >
        <v-icon start size="18">mdi-filter-remove-outline</v-icon>
        پاک کردن فیلترها
      </v-btn>
    </div>

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
      ></v-autocomplete>

      <v-autocomplete
        ref="unitAutocomplete"
        label="بخش"
        v-model="localFilters.unit"
        :items="dependentOptions.units"
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
        ref="courseAutocomplete"
        label="درس"
        v-model="localFilters.course"
        :items="dependentOptions.course"
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
        ref="teacherAutocomplete"
        label="نام استاد"
        v-model="localFilters.teacherName"
        :items="dependentOptions.teachersName"
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
        ref="genderAutocomplete"
        label="جنسیت"
        v-model="localFilters.gender"
        :items="dependentOptions.genders"
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
        ref="placeAutocomplete"
        label="مکان برگزاری کلاس"
        v-model="localFilters.place"
        :items="dependentOptions.places"
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
          <v-menu
            v-model="startMenu"
            :close-on-content-click="false"
            location="bottom end"
          >
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
              <div
                class="quick-slots d-flex flex-wrap gap-1 mt-2 justify-center"
              >
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
          <v-menu
            v-model="endMenu"
            :close-on-content-click="false"
            location="bottom end"
          >
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
              <div
                class="quick-slots d-flex flex-wrap gap-1 mt-2 justify-center"
              >
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
        :loading="loading"
        :disabled="loading"
        @click="handleSearchAndToggle"
      >
        <v-icon start size="20">mdi-magnify</v-icon>
        <span class="font-weight-bold">جستجو</span>
      </v-btn>
    </div>

    <!-- 2. Selected Courses Tab Content -->
    <div v-show="activeTab === 'selected'" class="px-2 pb-4 pt-4">
      <slot name="selected-courses"></slot>
    </div>

    <!-- Developer -->
    <div class="developer-credit-wrapper d-md-none">
      <div class="developer-credit">
        <span class="developer-credit-label">Designed &amp; Developed</span>
        <span class="developer-credit-name">BY Reza Azad</span>

        <a
          href="https://github.com/rashcode-com/Sess-Timetabling-App"
          target="_blank"
          rel="noopener noreferrer"
          class="developer-github-link"
          aria-label="View project on GitHub"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 128 128"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M56.7937 84.9688C44.4187 83.4688 35.7 74.5625 35.7 63.0313C35.7 58.3438 37.3875 53.2813 40.2 49.9063C38.9812 46.8125 39.1687 40.25 40.575 37.5313C44.325 37.0625 49.3875 39.0313 52.3875 41.75C55.95 40.625 59.7 40.0625 64.2937 40.0625C68.8875 40.0625 72.6375 40.625 76.0125 41.6563C78.9187 39.0313 84.075 37.0625 87.825 37.5313C89.1375 40.0625 89.325 46.625 88.1062 49.8125C91.1062 53.375 92.7 58.1563 92.7 63.0313C92.7 74.5625 83.9812 83.2813 71.4187 84.875C74.6062 86.9375 76.7625 91.4375 76.7625 96.5938L76.7625 106.344C76.7625 109.156 79.1062 110.75 81.9187 109.625C98.8875 103.156 112.2 86.1875 112.2 65.1875C112.2 38.6563 90.6375 17 64.1062 17C37.575 17 16.2 38.6562 16.2 65.1875C16.2 86 29.4187 103.25 47.2312 109.719C49.7625 110.656 52.2 108.969 52.2 106.438L52.2 98.9375C50.8875 99.5 49.2 99.875 47.7 99.875C41.5125 99.875 37.8562 96.5 35.2312 90.2188C34.2 87.6875 33.075 86.1875 30.9187 85.9063C29.7937 85.8125 29.4187 85.3438 29.4187 84.7813C29.4187 83.6563 31.2937 82.8125 33.1687 82.8125C35.8875 82.8125 38.2312 84.5 40.6687 87.9688C42.5437 90.6875 44.5125 91.9063 46.8562 91.9063C49.2 91.9063 50.7 91.0625 52.8562 88.9063C54.45 87.3125 55.6687 85.9063 56.7937 84.9688Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import {
  nextTick,
  ref,
  reactive,
  watch,
  computed,
  type Ref,
  type ComponentPublicInstance,
} from "vue";
import { useDisplay } from "vuetify";
import { toFarsiNumber } from "@sess/core";
import type { SearchEventPayload } from "@/types";
import { useCourseStore } from "@/store";

// Recomputed on every filter change so each autocomplete's options
// reflect what's actually still selectable given the others
const courseStore = useCourseStore();

const dependentOptions = computed(() =>
  courseStore.getDependentOptions({
    unit: localFilters.unit,
    course: localFilters.course,
    teacherName: localFilters.teacherName,
    gender: localFilters.gender,
    place: localFilters.place,
  }),
);

const { xs } = useDisplay();
const drawerWidth = computed<number>(() =>
  xs.value
    ? Math.min(
        300,
        (typeof window !== "undefined" ? window.innerWidth : 350) - 16,
      )
    : 350,
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
  loading?: boolean;
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
  loading = false,
} = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "tab-change", tab: string): void;
  (e: "search", payload: SearchEventPayload): void;
  (e: "toggle-drawer"): void;
}>();

// Controls the visibility of the clear filters button
const showClearFilters = ref<boolean>(false);

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

// Scroll the autocomplete field to the bottom after each new selection,
// keeping the latest selected item visible to the user.
type AutocompleteRef = Ref<ComponentPublicInstance | null>;

const unitAutocomplete = ref<ComponentPublicInstance | null>(null);
const courseAutocomplete = ref<ComponentPublicInstance | null>(null);
const teacherAutocomplete = ref<ComponentPublicInstance | null>(null);
const genderAutocomplete = ref<ComponentPublicInstance | null>(null);
const placeAutocomplete = ref<ComponentPublicInstance | null>(null);

// Scroll the Autocomplete input to the bottom so the latest entry is visible to the user
const scrollAutocompleteToBottom = async (autocomplete: AutocompleteRef) => {
  await nextTick();

  const input = autocomplete.value?.$el?.querySelector(".v-field__input");

  if (input) {
    input.scrollTop = input.scrollHeight;
  }
};

type MultiSelectKey = "unit" | "course" | "teacherName" | "gender" | "place";

const autocompleteWatchers: [MultiSelectKey, Ref<any>][] = [
  ["unit", unitAutocomplete],
  ["course", courseAutocomplete],
  ["teacherName", teacherAutocomplete],
  ["gender", genderAutocomplete],
  ["place", placeAutocomplete],
];

autocompleteWatchers.forEach(([key, autocomplete]) => {
  watch(
    () => localFilters[key].length,
    () => scrollAutocompleteToBottom(autocomplete),
  );
});

// Watching filtering changes
watch(
  () => [
    localFilters.unit.length,
    localFilters.course.length,
    localFilters.teacherName.length,
    localFilters.place.length,
    localFilters.gender.length,

    localTimeStart.value.length,
    localTimeEnd.value.length,
  ],
  () => {
    if (
      localFilters.unit.length ||
      localFilters.course.length ||
      localFilters.teacherName.length ||
      localFilters.place.length ||
      localFilters.gender.length ||
      localTimeStart.value.length ||
      localTimeEnd.value.length
    ) {
      showClearFilters.value = true;
    } else {
      showClearFilters.value = false;
    }
  },
);

watch(
  () => semesters,
  newSemesters => {
    if (newSemesters && newSemesters.length && !localFilters.semester) {
      localFilters.semester = newSemesters[0];
    }
  },
  { immediate: true },
);

watch(
  () => activeTab.value,
  newTab => {
    emit("tab-change", newTab);
  },
);

// Clear errors when fields are edited
watch(
  () => localFilters.semester,
  val => {
    if (val) semesterError.value = "";
  },
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
  },
);

// Time conversion helpers
const toStandardTime = (str?: string): string => {
  if (!str) return "";
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[۰-۹]/g, w => String(persianDigits.indexOf(w)));
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

const handleClearFilters = (): void => {
  localFilters.course = [];
  localFilters.gender = [];
  localFilters.place = [];
  localFilters.teacherName = [];
  localFilters.unit = [];

  localTimeStart.value = "";
  localTimeEnd.value = "";
  rawTimeStart.value = "";
  rawTimeEnd.value = "";

  startMenu.value = false;
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

const handleSearchAndToggle = () => {
  handleSearch();

  if (window.innerWidth < 1280) {
    emit("toggle-drawer");
  }
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
  overflow: hidden !important;
  background-color: rgb(var(--v-theme-surface));
}

.cursor-pointer :deep(input) {
  cursor: pointer !important;
}

.custom-form-field :deep(.v-field__input) {
  max-height: 64px;
  overflow-y: auto;

  /* hide scrollbar — Firefox */
  scrollbar-width: none;

  /* hide scrollbar — IE/Edge */
  -ms-overflow-style: none;
}

/* hide scrollbar — Chrome, Safari, Edge */
.custom-form-field :deep(.v-field__input)::-webkit-scrollbar {
  display: none;
}
.developer-credit-wrapper {
  margin-top: 30px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.developer-credit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  opacity: 0.45;
  text-decoration: none;

  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.developer-credit:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.developer-credit-label {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
}

.developer-credit-name {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgb(var(--v-theme-secondary));
}

.developer-github-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: inherit;
  font-size: 16px;
  text-decoration: none;

  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.developer-github-link:hover {
  opacity: 1;
}
</style>
