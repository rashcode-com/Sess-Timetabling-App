import { defineStore } from "pinia";
import { processDataset } from "../shared/services/courseDataService";
import rawData from "../data/data.json";
import type { Course, FilterOptions } from "../types";

export interface CourseState {
  rawJson: Record<string, Record<string, Course>> | null;
  courseList: Course[];
  courseMap: Map<string, Course>;
  filterOptions: FilterOptions;
  isDataLoaded: boolean;
}

export const useCourseStore = defineStore("courses", {
  state: (): CourseState => ({
    rawJson: null,
    courseList: [],
    courseMap: new Map<string, Course>(),
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
    semesters: (state): string[] => state.filterOptions.semesters,
    units: (state): string[] => state.filterOptions.units,
    courses: (state): string[] => state.filterOptions.course,
    teachers: (state): string[] => state.filterOptions.teachersName,
    places: (state): string[] => state.filterOptions.places,
    genders: (state): string[] => state.filterOptions.genders,
    filtersItems: (state): FilterOptions => state.filterOptions,
    getFilterItems: (state): FilterOptions => state.filterOptions,
    getCourseById: (state) => (id: string): Course | undefined => state.courseMap.get(id),
    totalCourseCount: (state): number => state.courseList.length,
  },

  actions: {
    initCourseData(customData?: unknown): void {
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
