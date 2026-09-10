import { defineStore } from "pinia";
import { processDataset } from "../shared/services/courseDataService";
import type { Course, FilterOptions } from "../types";

export interface CourseState {
  rawJson: Record<string, Record<string, Course>> | null;
  courseList: Course[];
  courseMap: Map<string, Course>;
  filterOptions: FilterOptions;
  isDataLoaded: boolean;
  isLoading: boolean;
  loadError: string | null;
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
    isLoading: false,
    loadError: null,
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
    async initCourseData(customData?: unknown): Promise<void> {
      if ((this.isDataLoaded || this.isLoading) && !customData) {
        return;
      }
      this.isLoading = true;
      this.loadError = null;

      try {
        let dataToProcess = customData;

        if (!dataToProcess) {
          if (typeof window !== "undefined" && typeof fetch === "function") {
            const baseUrl = import.meta.env.BASE_URL.endsWith("/")
              ? import.meta.env.BASE_URL
              : `${import.meta.env.BASE_URL}/`;
            const response = await fetch(`${baseUrl}data/data.json`);
            if (!response.ok) {
              throw new Error(`خطا در بارگذاری اطلاعات دروس (کد وضعیت: ${response.status})`);
            }
            dataToProcess = await response.json();
          } else {
            throw new Error("داده اولیه جهت بارگذاری ارسال نشده است.");
          }
        }

        const { dataset, filterOptions, courseList, courseMap } = processDataset(dataToProcess);
        this.rawJson = dataset;
        this.filterOptions = filterOptions;
        this.courseList = courseList;
        this.courseMap = courseMap;
        this.isDataLoaded = true;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "خطای ناشناخته در دریافت داده‌ها";
        this.loadError = errorMsg;
        console.error("[CourseStore] Failed to initialize course data:", err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
