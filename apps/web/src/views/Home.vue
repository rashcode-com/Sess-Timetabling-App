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
        :filters="filters"
        :semesters="getSemesters"
        :units="getUnits"
        :courses="getCourses"
        :teachers="getTeachers"
        :places="getPlaces"
        :genders="getGenders"
        :time-start.sync="timeStart"
        :time-end.sync="timeEnd"
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
import { mapFields } from "vuex-map-fields";
import { mapGetters } from "vuex";
import {
  checkClassTimeInterference,
  checkFinalTimeInterference,
  convertPersianNumToEng,
  toFarsiNumber,
} from "@sess/core";
import { searchCourses } from "@/shared/services/courseDataService";

import AppHeader from "@/shared/components/AppHeader.vue";
import ErrorDialog from "@/features/filters/components/ErrorDialog.vue";
import FilterDrawer from "@/features/filters/components/FilterDrawer.vue";
import CourseDataTable from "@/features/courses/components/CourseDataTable.vue";
import CourseDetailDialog from "@/features/courses/components/CourseDetailDialog.vue";
import WeeklyCalendar from "@/features/timetable/components/WeeklyCalendar.vue";
import SelectedCoursesTab from "@/features/timetable/components/SelectedCoursesTab.vue";
import ClashAlertModal from "@/features/timetable/components/ClashAlertModal.vue";
import ClashSnackbar from "@/features/timetable/components/ClashSnackbar.vue";

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
      timeStart: "",
      timeEnd: "",
      drawer: true,
      itemsPerPage: 10,

      dialog: false,
      dialogContent: {},
      vahedsSum: "۰",
      snackbarAlert: false,
      showSelectedListAlert: false,
      interferenceClassTimeCourse: [],
      interferenceFinalTimeCourses: [],
      showAlert: false,
      errorMessages: [],

      dataTableHeaders: [
        { text: "درس", value: "title" },
        { text: "استاد", value: "teacher" },
        { text: "گروه", value: "group" },
        { text: "زمان و مکان کلاس", value: "time_room" },
      ],

      selectedList: [],
      updateTimeDateText: "به روز شده در ۹ شهریور",
      updateTimeClockText: "ساعت ۱۱:۱۸",
    };
  },
  created() {
    this.filters.semester = this.getFilterItems.semesters[0];
  },
  watch: {
    selectedList() {
      // Check time interference
      this.interferenceClassTimeCourse = [];
      this.interferenceFinalTimeCourses = [];
      for (let i = 0; i < this.selectedList.length; i++) {
        for (let j = i + 1; j < this.selectedList.length; j++) {
          let course1 = this.selectedList[i];
          let course2 = this.selectedList[j];
          if (checkClassTimeInterference(course1, course2)) {
            this.interferenceClassTimeCourse.push([course1, course2]);
          }
          if (checkFinalTimeInterference(course1, course2)) {
            this.interferenceFinalTimeCourses.push([course1, course2]);
          }
        }
      }
      if (
        this.interferenceClassTimeCourse.length +
          this.interferenceFinalTimeCourses.length >
        0
      ) {
        this.snackbarAlert = true;
      } else {
        this.snackbarAlert = false;
      }

      this.vahedsSum = toFarsiNumber(this.sumOfVaheds());
    },
  },
  methods: {
    sumOfVaheds() {
      let sum = 0;
      for (let i = 0; i < this.selectedList.length; i++) {
        let course = this.selectedList[i];
        sum += convertPersianNumToEng(course["vahed"]);
      }
      return sum;
    },
    setDialogContent(item) {
      this.dialogContent = { ...item };
      this.dialog = true;
    },
    removeFromSelected(id) {
      this.selectedList = this.selectedList.filter((item) => item.id !== id);
    },
    search() {
      let flag = 0;
      this.errorMessages = [];

      if (!this.filters.semester) {
        this.errorMessages.push("نیمسال تحصیلی باید انتخاب شود");
        flag = 1;
      }
      if (
        !(
          this.filters.unit.length ||
          this.filters.course.length ||
          this.filters.teacherName.length
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

      this.results = searchCourses(this.json, this.filters, {
        timeStart: this.timeStart,
        timeEnd: this.timeEnd,
      });
    },
  },
  computed: {
    mobileDevice() {
      return this.$vuetify.breakpoint.smAndDown;
    },
    ...mapFields(["filters", "json", "course", "results"]),
    ...mapGetters([
      "getSemesters",
      "getUnits",
      "getCourses",
      "getTeachers",
      "getFilterItems",
      "getPlaces",
      "getGenders",
    ]),
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
