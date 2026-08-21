<template>
  <v-navigation-drawer
    fixed
    right
    :value="value"
    @input="$emit('input', $event)"
    style="width:320px"
    hide-overlay
  >
    <template v-slot:prepend>
      <v-list-item two-line>
        <v-tabs v-model="activeTabIndex">
          <v-tab @click="filterTabClick">
            فیلتر
          </v-tab>
          <v-tab @click="selectTabClicked">
            دروس انتخاب شده
          </v-tab>

          <v-tabs-slider color="blue"></v-tabs-slider>
        </v-tabs>
        <v-app-bar-nav-icon
          style="background:#eee6"
          @click.stop="$emit('input', !value)"
        >
          <v-icon x-large>mdi-chevron-right</v-icon>
        </v-app-bar-nav-icon>
      </v-list-item>
    </template>

    <v-divider></v-divider>

    <v-list v-if="filterTabActive" dense>
      <v-list-item>
        <v-autocomplete
          solo
          label="نیمسال تحصیلی*"
          v-model="localFilters.semester"
          :rules="rules"
          :items="semesters"
          hide-no-data
          hide-details="auto"
          class="mb-3"
          hide-selected
          chips
          :search-input.sync="searchInput1"
          @change="searchInput1 = ''"
        >
          <template v-slot:selection="data">
            <v-chip v-bind="data.attrs" close @click:close="remove(data)">
              {{ data.item }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-list-item>

      <v-list-item>
        <v-autocomplete
          solo
          label="بخش"
          v-model="localFilters.unit"
          :items="units"
          multiple
          hide-no-data
          hide-details="auto"
          class="mb-3"
          chips
          :search-input.sync="searchInput2"
          @change="searchInput2 = ''"
        >
          <template v-slot:selection="data">
            <v-chip v-bind="data.attrs" close @click:close="remove(data)">
              {{ data.item }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-list-item>

      <v-list-item>
        <v-autocomplete
          solo
          label="درس"
          v-model="localFilters.course"
          :items="courses"
          multiple
          hide-no-data
          hide-details="auto"
          class="mb-3"
          chips
          :search-input.sync="searchInput3"
          @change="searchInput3 = ''"
        >
          <template v-slot:selection="data">
            <v-chip v-bind="data.attrs" close @click:close="remove(data)">
              {{ data.item }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-list-item>

      <v-list-item>
        <v-autocomplete
          solo
          label="نام استاد"
          v-model="localFilters.teacherName"
          :items="teachers"
          hide-details="auto"
          class="mb-3"
          hide-no-data
          multiple
          chips
          :search-input.sync="searchInput4"
          @change="searchInput4 = ''"
        >
          <template v-slot:selection="data">
            <v-chip v-bind="data.attrs" close @click:close="remove(data)">
              {{ data.item }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-list-item>

      <v-list-item>
        <v-autocomplete
          solo
          label="جنسیت"
          v-model="localFilters.gender"
          :items="genders"
          multiple
          hide-no-data
          hide-details="auto"
          class="mb-3"
          chips
          :search-input.sync="searchInput7"
          @change="searchInput7 = ''"
        >
          <template v-slot:selection="data">
            <v-chip v-bind="data.attrs" close @click:close="remove(data)">
              {{ data.item }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-list-item>

      <v-list-item>
        <v-autocomplete
          solo
          label="مکان برگزاری کلاس"
          v-model="localFilters.place"
          chips
          multiple
          hide-no-data
          hide-details="auto"
          class="mb-3"
          :items="places"
          :search-input.sync="searchInput6"
          @change="searchInput6 = ''"
        >
          <template v-slot:selection="data">
            <v-chip v-bind="data.attrs" close @click:close="remove(data)">
              {{ data.item }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-list-item>

      <v-list-item>
        <v-menu
          ref="menu1"
          v-model="menuStart"
          :close-on-content-click="false"
          :nudge-right="40"
          :return-value.sync="localTimeStart"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="localTimeStart"
              label="از ساعت"
              prepend-icon="mdi-clock-time-four-outline"
              readonly
              hide-details="auto"
              class="mb-3"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
            <v-icon class="closeTime" @click="clearTimeStart">
              mdi-close
            </v-icon>
          </template>
          <v-time-picker
            v-if="menuStart"
            v-model="localTimeStart"
            format="24hr"
            full-width
            @click:minute="saveTimeStart"
          ></v-time-picker>
        </v-menu>
      </v-list-item>

      <v-list-item>
        <v-menu
          ref="menu2"
          v-model="menuEnd"
          :close-on-content-click="false"
          :nudge-right="40"
          :return-value.sync="localTimeEnd"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="localTimeEnd"
              label="تا ساعت"
              prepend-icon="mdi-clock-time-four-outline"
              readonly
              hide-details="auto"
              class="mb-3"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
            <v-icon class="closeTime" @click="clearTimeEnd">
              mdi-close
            </v-icon>
          </template>
          <v-time-picker
            v-if="menuEnd"
            v-model="localTimeEnd"
            format="24hr"
            full-width
            @click:minute="saveTimeEnd"
          ></v-time-picker>
        </v-menu>
      </v-list-item>

      <v-list-item>
        <v-btn
          width="100%"
          x-large
          class="blue white--text"
          @click="handleSearch"
        >
          <h3>جستجو</h3>
        </v-btn>
      </v-list-item>
    </v-list>

    <v-list v-if="selectedTabActive">
      <slot name="selected-courses"></slot>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "FilterDrawer",
  props: {
    value: {
      type: Boolean,
      default: true,
    },
    semesters: {
      type: Array,
      default: () => [],
    },
    units: {
      type: Array,
      default: () => [],
    },
    courses: {
      type: Array,
      default: () => [],
    },
    teachers: {
      type: Array,
      default: () => [],
    },
    places: {
      type: Array,
      default: () => [],
    },
    genders: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      activeTabIndex: 0,
      filterTabActive: true,
      selectedTabActive: false,
      menuStart: false,
      menuEnd: false,
      localTimeStart: "",
      localTimeEnd: "",
      localFilters: {
        semester: "",
        unit: [],
        course: [],
        teacherName: [],
        place: [],
        gender: [],
      },
      searchInput1: "",
      searchInput2: "",
      searchInput3: "",
      searchInput4: "",
      searchInput6: "",
      searchInput7: "",
      rules: [(value) => !!value || "نیمسال تحصیلی باید انتخاب شود."],
    };
  },
  watch: {
    semesters: {
      immediate: true,
      handler(newSemesters) {
        if (newSemesters && newSemesters.length && !this.localFilters.semester) {
          this.localFilters.semester = newSemesters[0];
        }
      },
    },
  },
  methods: {
    filterTabClick() {
      this.filterTabActive = true;
      this.selectedTabActive = false;
      this.$emit("tab-change", "filter");
    },
    selectTabClicked() {
      this.filterTabActive = false;
      this.selectedTabActive = true;
      this.$emit("tab-change", "selected");
    },
    saveTimeStart() {
      this.$refs.menu1.save(this.localTimeStart);
    },
    saveTimeEnd() {
      this.$refs.menu2.save(this.localTimeEnd);
    },
    clearTimeStart() {
      this.localTimeStart = "";
      if (this.$refs.menu1) {
        this.$refs.menu1.save("");
      }
    },
    clearTimeEnd() {
      this.localTimeEnd = "";
      if (this.$refs.menu2) {
        this.$refs.menu2.save("");
      }
    },
    handleSearch() {
      this.$emit("search", {
        filters: {
          semester: this.localFilters.semester,
          unit: [...this.localFilters.unit],
          course: [...this.localFilters.course],
          teacherName: [...this.localFilters.teacherName],
          place: [...this.localFilters.place],
          gender: [...this.localFilters.gender],
        },
        timeRange: {
          timeStart: this.localTimeStart,
          timeEnd: this.localTimeEnd,
        },
      });
    },
    remove(item) {
      const parentLabel = (item.parent && item.parent.label) || "";
      if (parentLabel.includes("بخش")) {
        const idx = this.localFilters.unit.indexOf(item.item);
        if (idx !== -1) this.localFilters.unit.splice(idx, 1);
      } else if (parentLabel.includes("درس")) {
        const idx = this.localFilters.course.indexOf(item.item);
        if (idx !== -1) this.localFilters.course.splice(idx, 1);
      } else if (parentLabel.includes("نام استاد")) {
        const idx = this.localFilters.teacherName.indexOf(item.item);
        if (idx !== -1) this.localFilters.teacherName.splice(idx, 1);
      } else if (parentLabel.includes("نیمسال تحصیلی")) {
        this.localFilters.semester = "";
      } else if (parentLabel.includes("مکان برگزاری کلاس")) {
        const idx = this.localFilters.place.indexOf(item.item);
        if (idx !== -1) this.localFilters.place.splice(idx, 1);
      } else if (parentLabel.includes("جنسیت")) {
        const idx = this.localFilters.gender.indexOf(item.item);
        if (idx !== -1) this.localFilters.gender.splice(idx, 1);
      }
    },
  },
};
</script>

<style scoped>
.closeTime {
  position: absolute !important;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
}
</style>
