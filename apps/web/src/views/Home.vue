<template>
  <div class="home-canvas">
    <!-- 1. Filter Navigation Drawer (Responsive: temporary on mobile, togglable on desktop) -->
    <FilterDrawer
      v-model="drawer"
      :temporary="mobileDevice"
      :semesters="semesters"
      :units="units"
      :courses="courses"
      :teachers="teachers"
      :places="places"
      :genders="genders"
      :selected-count="selectedList.length"
      @search="search"
    >
      <template #selected-courses>
        <!-- 2. Selected Courses Tab in Drawer -->
        <SelectedCoursesTab
          :selected-list="selectedList"
          :interference-count="totalConflictCount"
          :vaheds-sum="vahedsSum"
          @show-details="setDialogContent"
          @remove-course="removeFromSelected"
          @open-clash-modal="showSelectedListAlert = true"
        />
      </template>
    </FilterDrawer>

    <!-- 3. Course Details Modal -->
    <CourseDetailDialog
      v-model="dialog"
      :course="dialogContent"
    />

    <!-- 4. Clash Conflict Modal -->
    <ClashAlertModal
      v-model="showSelectedListAlert"
      :class-time-conflicts="classTimeConflicts"
      :final-exam-conflicts="finalExamConflicts"
    />

    <!-- 5. Clash Alert Snackbar -->
    <ClashSnackbar
      v-model="snackbarAlert"
      @view-details="showSelectedListAlert = true"
    />

    <!-- Main Content Area -->
    <div class="main-content-wrapper">
      <v-container fluid class="pa-2 pa-sm-3 pa-md-4 main-container">
        <!-- 7. Application Header with Integrated Drawer Toggle (Fix Bug 24) -->
        <AppHeader
          :update-time-date-text="updateTimeDateText"
          :update-time-clock-text="updateTimeClockText"
          @toggle-drawer="drawer = !drawer"
        />

        <!-- Main Body: Results & Timetable -->
        <div class="mt-3">
          <!-- 1. Weekly Calendar Grid (Always rendered when user has selected courses) -->
          <WeeklyCalendar
            v-if="selectedList && selectedList.length > 0"
            :selected-list="selectedList"
            :mobile-device="mobileDevice"
          />

          <!-- 2. Search Results Section -->
          <div v-if="results.length > 0 && results[0] !== -1">
            <!-- Section Title & Results Counter (Persian Digits - Fix Bug 17) -->
            <div class="d-flex align-center justify-space-between mb-3 mt-4">
              <div class="d-flex align-center gap-2">
                <v-icon color="primary" size="22">mdi-table</v-icon>
                <h2 class="text-h6 font-weight-bold mb-0">نتایج جستجو</h2>
                <v-chip color="primary" variant="tonal" size="x-small" class="font-weight-bold mr-2">
                  {{ toFarsiNumber(results.length) }} درس یافت شد
                </v-chip>
              </div>
            </div>

            <!-- Results Data Table -->
            <CourseDataTable
              v-model="selectedList"
              :results="results"
              :headers="dataTableHeaders"
              :items-per-page="itemsPerPage"
              :mobile-device="mobileDevice"
            />
          </div>

          <!-- 2. No Results Found State -->
          <v-card
            v-else-if="results.length > 0 && results[0] === -1"
            class="pa-10 text-center mx-1"
            rounded="lg"
            elevation="1"
          >
            <v-avatar color="warning" variant="tonal" size="64" class="mb-3">
              <v-icon color="warning" size="36">mdi-database-search-outline</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">موردی یافت نشد</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              با معیارهای فیلتر انتخاب شده هیچ درسی پیدا نشد. لطفاً فیلترها را تغییر دهید.
            </p>
          </v-card>

          <!-- 3. Initial Empty State (Only displayed when no courses are selected and no search is executed) -->
          <v-card
            v-else-if="(!selectedList || selectedList.length === 0) && results.length === 0"
            class="pa-10 text-center mx-1 empty-state-card"
            rounded="lg"
            elevation="0"
          >
            <v-avatar color="primary" variant="tonal" size="64" class="mb-3">
              <v-icon color="primary" size="36">mdi-filter-cog-outline</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-2">برای نمایش دروس، فیلترها را انتخاب کنید</h3>
            <p class="text-body-2 text-medium-emphasis mb-5" style="max-width: 500px; margin: 0 auto;">
              از منوی کشویی سمت راست، نیمسال تحصیلی و حداقل یکی از موارد بخش، درس یا استاد را انتخاب کرده و دکمه جستجو را بزنید.
            </p>
            <v-btn
              v-if="!drawer"
              color="primary"
              variant="flat"
              rounded="sm"
              class="font-weight-medium"
              @click="drawer = true"
            >
              <v-icon start size="18">mdi-filter-variant</v-icon>
              باز کردن فیلترها
            </v-btn>
          </v-card>
        </div>
      </v-container>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDisplay } from "vuetify";
import { toFarsiNumber } from "@sess/core";
import { useCourseStore, useTimetableStore } from "@/store";
import { AppHeader } from "@/shared";
import { FilterDrawer } from "@/features/filters";
import { CourseDataTable, CourseDetailDialog } from "@/features/courses";
import {
  WeeklyCalendar,
  SelectedCoursesTab,
  ClashAlertModal,
  ClashSnackbar,
} from "@/features/timetable";

const { smAndDown: mobileDevice } = useDisplay();

const courseStore = useCourseStore();
const timetableStore = useTimetableStore();

const {
  semesters,
  units,
  courses,
  teachers,
  places,
  genders,
  rawJson,
} = storeToRefs(courseStore);

const {
  selectedCourses: selectedList,
  searchResults: results,
  classTimeConflicts,
  finalExamConflicts,
  totalConflictCount,
  vahedsSum,
} = storeToRefs(timetableStore);

const drawer = ref(true);
const itemsPerPage = ref(10);
const dialog = ref(false);
const dialogContent = ref({});
const snackbarAlert = ref(false);
const showSelectedListAlert = ref(false);

const dataTableHeaders = [
  { title: "درس", key: "title", sortable: true },
  { title: "استاد", key: "teacher", sortable: true },
  { title: "گروه", key: "group", sortable: true, width: "100px" },
  { title: "زمان و مکان کلاس", key: "time_room", sortable: false },
];

const updateTimeDateText = "به روز شده در ۹ شهریور";
const updateTimeClockText = "ساعت ۱۱:۱۸";

watch(
  () => totalConflictCount.value,
  (newCount) => {
    if (newCount > 0) {
      snackbarAlert.value = true;
    }
  }
);

const setDialogContent = (item) => {
  dialogContent.value = { ...item };
  dialog.value = true;
};

const removeFromSelected = (id) => {
  timetableStore.removeCourse(id);
};

const search = ({ filters, timeRange }) => {
  timetableStore.executeSearch(rawJson.value, filters, timeRange);
};
</script>

<style scoped>
.home-canvas {
  background-color: var(--color-bg);
  min-height: 100vh;
  width: 100%;
}

.main-content-wrapper {
  width: 100%;
}

.main-container {
  max-width: 100% !important;
}

.empty-state-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgb(var(--v-theme-surface));
  box-shadow: var(--shadow-sm) !important;
}
</style>
