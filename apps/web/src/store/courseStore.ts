import { defineStore } from "pinia";
import { formatPersianDate, formatPersianTime } from "@sess/core";
import { processDataset } from "../shared/services/courseDataService";
import type {
  Course,
  FilterOptions,
  SearchFilters,
  UnifiedCatalog,
} from "../types";
import { getDependentFilterOptions } from "../shared/services/courseDataService";

export interface CourseState {
  rawJson: Record<string, Record<string, Course>> | null;
  rawCatalog: UnifiedCatalog | null;
  rawRawData: unknown;
  courseList: Course[];
  courseMap: Map<string, Course>;
  filterOptions: FilterOptions;
  updatedAt: string | null;
  activeSemester: string;
  availableSemesters: string[];
  isDataLoaded: boolean;
  isLoading: boolean;
  loadError: string | null;
}

export const useCourseStore = defineStore("courses", {
  state: (): CourseState => ({
    rawJson: null,
    rawCatalog: null,
    rawRawData: null,
    courseList: [],
    courseMap: new Map<string, Course>(),
    filterOptions: {
      semesters: [],
      units: [],
      course: [],
      teachersName: [],
      times: [],
      places: [],
      genders: [],
    },
    updatedAt: null,
    activeSemester: "",
    availableSemesters: [],
    isDataLoaded: false,
    isLoading: false,
    loadError: null,
  }),

  getters: {
    // Returns filter options narrowed by the caller's current selections,
    // used by FilterDrawer to make filters affect each other
    getDependentOptions: state => (currentFilters: SearchFilters) =>
      getDependentFilterOptions(state.rawJson, currentFilters),
    semesters: (state): string[] => state.filterOptions.semesters,
    units: (state): string[] => state.filterOptions.units,
    courses: (state): string[] => state.filterOptions.course,
    teachers: (state): string[] => state.filterOptions.teachersName,
    places: (state): string[] => state.filterOptions.places,
    genders: (state): string[] => state.filterOptions.genders,
    filtersItems: (state): FilterOptions => state.filterOptions,
    getFilterItems: (state): FilterOptions => state.filterOptions,
    getCourseById:
      state =>
      (id: string): Course | undefined =>
        state.courseMap.get(id),
    totalCourseCount: (state): number => state.courseList.length,
    formattedUpdateDate: (state): string => {
      if (!state.updatedAt) return "";
      return formatPersianDate(state.updatedAt, {
        includeYear: true,
        prefix: "به‌روز شده در",
      });
    },
    formattedUpdateTime: (state): string => {
      if (!state.updatedAt) return "";
      const t = formatPersianTime(state.updatedAt);
      return t ? `ساعت ${t}` : "";
    },
  },

  actions: {
    async initCourseData(
      customData?: unknown,
      targetSemester?: string,
    ): Promise<void> {
      // 1. Prevent race condition during concurrent background fetch
      if (this.isLoading) return;

      // 2. Prevent redundant processing if dataset is already loaded for the active semester
      if (
        this.isDataLoaded &&
        !customData &&
        (!targetSemester || targetSemester === this.activeSemester)
      ) {
        return;
      }

      // 3. Fast in-memory switch if dataset is already present in state
      if (
        this.isDataLoaded &&
        !customData &&
        targetSemester &&
        this.rawRawData
      ) {
        this.switchSemester(targetSemester);
        return;
      }

      this.isLoading = true;
      this.loadError = null;

      try {
        let dataToProcess = customData || this.rawRawData;

        if (!dataToProcess) {
          if (typeof window !== "undefined" && typeof fetch === "function") {
            const baseUrl = import.meta.env.BASE_URL.endsWith("/")
              ? import.meta.env.BASE_URL
              : `${import.meta.env.BASE_URL}/`;
            const response = await fetch(`${baseUrl}data/data.json`);
            if (!response.ok) {
              throw new Error(
                `خطا در بارگذاری اطلاعات دروس (کد وضعیت: ${response.status})`,
              );
            }
            dataToProcess = await response.json();
          } else {
            throw new Error("داده اولیه جهت بارگذاری ارسال نشده است.");
          }
        }

        this.rawRawData = dataToProcess;
        const {
          dataset,
          filterOptions,
          courseList,
          courseMap,
          activeSemester,
          availableSemesters,
          updatedAt,
          rawCatalog,
        } = processDataset(dataToProcess, targetSemester);

        this.rawJson = dataset;
        this.filterOptions = filterOptions;
        this.courseList = courseList;
        this.courseMap = courseMap;
        this.activeSemester = activeSemester;
        this.availableSemesters = availableSemesters;
        this.updatedAt = updatedAt;
        this.rawCatalog = rawCatalog || null;
        this.isDataLoaded = true;
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "خطای ناشناخته در دریافت داده‌ها";
        this.loadError = errorMsg;
        console.error("[CourseStore] Failed to initialize course data:", err);
      } finally {
        this.isLoading = false;
      }
    },

    switchSemester(targetSemester: string): void {
      if (!this.rawRawData || targetSemester === this.activeSemester) return;

      const {
        dataset,
        filterOptions,
        courseList,
        courseMap,
        activeSemester,
        availableSemesters,
        updatedAt,
        rawCatalog,
      } = processDataset(this.rawRawData, targetSemester);

      this.rawJson = dataset;
      this.filterOptions = filterOptions;
      this.courseList = courseList;
      this.courseMap = courseMap;
      this.activeSemester = activeSemester;
      this.availableSemesters = availableSemesters;
      this.updatedAt = updatedAt;
      this.rawCatalog = rawCatalog || null;
    },
  },
});
