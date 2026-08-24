<template>
  <div class="home">
    <!-- 1. Validation Error Dialog -->
    <ErrorDialog
      v-model="showAlert"
      :error-messages="errorMessages"
    />

    <v-card class="wholePageContent">
      <!-- Nav Drawer Toggler Button -->
      <v-app-bar-nav-icon
        style="background:#eee6"
        class="outNavToggler"
        @click.stop="drawer = !drawer"
      >
        <v-icon x-large>mdi-chevron-left</v-icon>
      </v-app-bar-nav-icon>

      <!-- 2. Filter Navigation Drawer -->
      <FilterDrawer
        v-model="drawer"
        :semesters="getSemesters"
        :units="getUnits"
        :courses="getCourses"
        :teachers="getTeachers"
        :places="getPlaces"
        :genders="getGenders"
        @search="search"
      >
        <template v-slot:selected-courses>
          <!-- 3. Selected Courses Tab in Drawer -->
          <SelectedCoursesTab
            :selected-list="selectedList"
            :interference-count="
              interferenceClassTimeCourse.length +
                interferenceFinalTimeCourses.length
            "
            :vaheds-sum="vahedsSum"
            @show-details="setDialogContent"
            @remove-course="removeFromSelected"
            @open-clash-modal="showSelectedListAlert = true"
          />
        </template>
      </FilterDrawer>

      <!-- 4. Course Details Modal -->
      <CourseDetailDialog
        v-model="dialog"
        :course="dialogContent"
      />

      <!-- 5. Clash Conflict Modal -->
      <ClashAlertModal
        v-model="showSelectedListAlert"
        :class-time-conflicts="interferenceClassTimeCourse"
        :final-exam-conflicts="interferenceFinalTimeCourses"
      />

      <!-- 6. Clash Alert Snackbar -->
      <ClashSnackbar
        v-model="snackbarAlert"
        @view-details="showSelectedListAlert = true"
      />

      <!-- Main Page Content -->
      <div :class="drawer ? 'exeptNav' : ''">
        <!-- 7. Responsive Header -->
        <AppHeader
          :update-time-date-text="updateTimeDateText"
          :update-time-clock-text="updateTimeClockText"
        />

        <v-spacer class="mt-6"></v-spacer>

        <!-- Search Results & Calendar Container -->
        <div class="white rounded-lg justify-content-center ma-2" fluid>
          <!-- 1. Search Results Found -->
          <div
            v-if="results.length > 0 && results[0] !== -1"
            :class="mobileDevice ? 'pa-3' : 'pa-6'"
          >
            <h2 class="text-center my-4" id="search-h">نتایج جستجو</h2>

            <!-- 8. Weekly Calendar Grid -->
            <WeeklyCalendar
              :selected-list="selectedList"
              :mobile-device="mobileDevice"
            />

            <v-spacer v-if="selectedList.length" class="my-8"><hr /></v-spacer>

            <!-- 9. Results Data Table -->
            <CourseDataTable
              v-model="selectedList"
              :results="results"
              :headers="dataTableHeaders"
              :items-per-page="itemsPerPage"
              :mobile-device="mobileDevice"
            />
          </div>

          <!-- 2. No Results Found -->
          <v-row
            v-else-if="results.length > 0 && results[0] === -1"
            class="ma-2 pa-4"
            justify="center"
          >
            <h2 class="text-center">موردی پیدا نشد</h2>
          </v-row>

          <!-- 3. Initial State -->
          <v-row v-else class="ma-2 pa-4" justify="center">
            <h2 class="text-center">برای نمایش نتایج، فیلتر ها را پر کنید</h2>
          </v-row>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { mapState, mapWritableState } from "pinia";
import { useCourseStore, useTimetableStore } from "@/store";
import { AppHeader } from "@/shared";
import { FilterDrawer, ErrorDialog } from "@/features/filters";
import { CourseDataTable, CourseDetailDialog } from "@/features/courses";
import {
  WeeklyCalendar,
  SelectedCoursesTab,
  ClashAlertModal,
  ClashSnackbar,
} from "@/features/timetable";

export default {
  name: "Home",
  components: {
    AppHeader,
    ErrorDialog,
    FilterDrawer,
    CourseDataTable,
    CourseDetailDialog,
    WeeklyCalendar,
    SelectedCoursesTab,
    ClashAlertModal,
    ClashSnackbar,
  },
  data() {
    return {
      drawer: true,
      itemsPerPage: 10,

      dialog: false,
      dialogContent: {},
      snackbarAlert: false,
      showSelectedListAlert: false,
      showAlert: false,
      errorMessages: [],

      dataTableHeaders: [
        { text: "درس", value: "title" },
        { text: "استاد", value: "teacher" },
        { text: "گروه", value: "group" },
        { text: "زمان و مکان کلاس", value: "time_room" },
      ],

      updateTimeDateText: "به روز شده در ۹ شهریور",
      updateTimeClockText: "ساعت ۱۱:۱۸",
    };
  },
  watch: {
    selectedList() {
      this.snackbarAlert = this.totalConflictCount > 0;
    },
  },
  methods: {
    setDialogContent(item) {
      this.dialogContent = { ...item };
      this.dialog = true;
    },
    removeFromSelected(id) {
      const timetableStore = useTimetableStore();
      timetableStore.removeCourse(id);
    },
    search({ filters, timeRange }) {
      let flag = 0;
      this.errorMessages = [];

      if (!filters || !filters.semester) {
        this.errorMessages.push("نیمسال تحصیلی باید انتخاب شود");
        flag = 1;
      }
      if (
        !filters ||
        !(
          (filters.unit && filters.unit.length) ||
          (filters.course && filters.course.length) ||
          (filters.teacherName && filters.teacherName.length)
        )
      ) {
        this.errorMessages.push(
          "حداقل یکی از موارد بخش، درس یا نام استاد باید انتخاب شود."
        );
        flag = 1;
      }
      if (flag) {
        this.showAlert = true;
        return;
      }

      const courseStore = useCourseStore();
      const timetableStore = useTimetableStore();
      timetableStore.executeSearch(courseStore.rawJson, filters, timeRange);
    },
  },
  computed: {
    mobileDevice() {
      return this.$vuetify.breakpoint.smAndDown;
    },
    ...mapState(useCourseStore, {
      getSemesters: "semesters",
      getUnits: "units",
      getCourses: "courses",
      getTeachers: "teachers",
      getPlaces: "places",
      getGenders: "genders",
      getFilterItems: "filterOptions",
      getJson: "rawJson",
    }),
    ...mapWritableState(useTimetableStore, {
      selectedList: "selectedCourses",
      results: "searchResults",
    }),
    ...mapState(useTimetableStore, {
      interferenceClassTimeCourse: "classTimeConflicts",
      interferenceFinalTimeCourses: "finalExamConflicts",
      totalConflictCount: "totalConflictCount",
      vahedsSum: "vahedsSum",
    }),
  },
};
</script>

<style scoped>
.wholePageContent {
  background: url("../assets/background.jpg") no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
  margin-top: 0;
  padding-top: 2rem;
  padding-bottom: 2rem;
  border-radius: 0px !important;
}

.home {
  font-family: "Vazir", sans-serif;
}

#search-h {
  margin-top: 50px;
}

/* nav */
.outNavToggler {
  position: fixed;
  top: 1rem;
  right: 1rem;
}

.exeptNav {
  width: calc(100% - 320px);
  margin-right: 320px;
}

@media screen and (max-width: 768px) {
  .exeptNav {
    width: 100%;
    margin-right: auto;
  }
}
</style>
