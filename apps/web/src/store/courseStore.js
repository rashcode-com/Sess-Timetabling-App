import { defineStore } from "pinia";
import { processDataset } from "../shared/services/courseDataService.js";
import rawData from "../data/data.json" with { type: "json" };

export const useCourseStore = defineStore("courses", {
  state: () => ({
    rawJson: null,
    courseList: [],
    courseMap: new Map(),
    filterOptions: {
      semesters: ["1402-1"],
      units: [],
      course: [],
      teachersName: [],
      times: [],
      places: [],
      genders: [],
    },
    isDataLoaded: false,
  }),

  getters: {
    semesters: (state) => state.filterOptions.semesters,
    units: (state) => state.filterOptions.units,
    courses: (state) => state.filterOptions.course,
    teachers: (state) => state.filterOptions.teachersName,
    places: (state) => state.filterOptions.places,
    genders: (state) => state.filterOptions.genders,
    filtersItems: (state) => state.filterOptions,
    getFilterItems: (state) => state.filterOptions,
    getCourseById: (state) => (id) => state.courseMap.get(id),
    totalCourseCount: (state) => state.courseList.length,
  },

  actions: {
    initCourseData(customData) {
      if (this.isDataLoaded && !customData) {
        return;
      }
      const dataToProcess = customData || rawData;
      const { dataset, filterOptions, courseList, courseMap } = processDataset(dataToProcess);
      this.rawJson = dataset;
      this.filterOptions = filterOptions;
      this.courseList = courseList;
      this.courseMap = courseMap;
      this.isDataLoaded = true;
    },
  },
});
