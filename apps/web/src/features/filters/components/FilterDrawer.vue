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
          v-model="filters.semester"
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
          v-model="filters.unit"
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
          v-model="filters.course"
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
          v-model="filters.teacherName"
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
          v-model="filters.gender"
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
          v-model="filters.place"
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
              :value="timeStart"
              label="از ساعت"
              prepend-icon="mdi-clock-time-four-outline"
              readonly
              hide-details="auto"
              class="mb-3"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
            <v-icon class="closeTime" @click="$emit('update:timeStart', '')">
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
              :value="timeEnd"
              label="تا ساعت"
              prepend-icon="mdi-clock-time-four-outline"
              readonly
              hide-details="auto"
              class="mb-3"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
            <v-icon class="closeTime" @click="$emit('update:timeEnd', '')">
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
          @click="$emit('search')"
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
    filters: {
      type: Object,
      required: true,
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
    timeStart: {
      type: String,
      default: "",
    },
    timeEnd: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      activeTabIndex: 0,
      filterTabActive: true,
      selectedTabActive: false,
      menuStart: false,
      menuEnd: false,
      localTimeStart: this.timeStart,
      localTimeEnd: this.timeEnd,
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
    timeStart(val) {
      this.localTimeStart = val;
    },
    timeEnd(val) {
      this.localTimeEnd = val;
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
      this.$emit("update:timeStart", this.localTimeStart);
    },
    saveTimeEnd() {
      this.$refs.menu2.save(this.localTimeEnd);
      this.$emit("update:timeEnd", this.localTimeEnd);
    },
    remove(item) {
      if (item.parent.label.includes("بخش")) {
        this.filters.unit.splice(this.filters.unit.indexOf(item.item), 1);
      } else if (item.parent.label.includes("درس")) {
        this.filters.course.splice(this.filters.course.indexOf(item.item), 1);
      } else if (item.parent.label.includes("نام استاد")) {
        this.filters.teacherName.splice(
          this.filters.teacherName.indexOf(item.item),
          1
        );
      } else if (item.parent.label.includes("نیمسال تحصیلی")) {
        this.filters.semester = "";
      } else if (item.parent.label.includes("مکان برگزاری کلاس")) {
        this.filters.place.splice(this.filters.place.indexOf(item.item), 1);
      } else if (item.parent.label.includes("جنسیت")) {
        this.filters.gender.splice(this.filters.gender.indexOf(item.item), 1);
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
