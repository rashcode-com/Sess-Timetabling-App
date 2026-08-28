import { defineStore } from "pinia";
import {
  checkClassTimeInterference,
  checkFinalTimeInterference,
  convertPersianNumToEng,
  toFarsiNumber,
} from "@sess/core";
import { searchCourses } from "../shared/services/courseDataService";
import type {
  Course,
  CourseConflictPair,
  SearchFilters,
  TimeRangeFilter,
} from "../types";

export interface TimetableState {
  selectedCourses: Course[];
  searchResults: Course[] | [-1];
}

export const useTimetableStore = defineStore("timetable", {
  state: (): TimetableState => ({
    selectedCourses: [],
    searchResults: [],
  }),

  getters: {
    selectedList: (state): Course[] => state.selectedCourses,
    results: (state): Course[] | [-1] => state.searchResults,
    selectedCount: (state): number => state.selectedCourses.length,

    vahedsSumNumber: (state): number => {
      let sum = 0;
      for (let i = 0; i < state.selectedCourses.length; i++) {
        const course = state.selectedCourses[i];
        if (course && course.vahed) {
          sum += convertPersianNumToEng(course.vahed);
        }
      }
      return sum;
    },

    vahedsSum: (state): string => {
      let sum = 0;
      for (let i = 0; i < state.selectedCourses.length; i++) {
        const course = state.selectedCourses[i];
        if (course && course.vahed) {
          sum += convertPersianNumToEng(course.vahed);
        }
      }
      return toFarsiNumber(sum);
    },

    classTimeConflicts: (state): CourseConflictPair[] => {
      const conflicts: CourseConflictPair[] = [];
      const list = state.selectedCourses;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (checkClassTimeInterference(list[i], list[j])) {
            conflicts.push([list[i], list[j]]);
          }
        }
      }
      return conflicts;
    },

    finalExamConflicts: (state): CourseConflictPair[] => {
      const conflicts: CourseConflictPair[] = [];
      const list = state.selectedCourses;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (checkFinalTimeInterference(list[i], list[j])) {
            conflicts.push([list[i], list[j]]);
          }
        }
      }
      return conflicts;
    },

    totalConflictCount(): number {
      return this.classTimeConflicts.length + this.finalExamConflicts.length;
    },

    hasConflicts(): boolean {
      return this.totalConflictCount > 0;
    },

    isCourseSelected: (state) => (id: string): boolean => {
      return state.selectedCourses.some((c) => c.id === id);
    },
  },

  actions: {
    setSelectedCourses(courses: Course[]): void {
      this.selectedCourses = Array.isArray(courses) ? courses : [];
    },

    addCourse(course: Course): void {
      if (!course) return;
      if (!this.selectedCourses.some((c) => c.id === course.id)) {
        this.selectedCourses.push(course);
      }
    },

    removeCourse(courseId: string): void {
      this.selectedCourses = this.selectedCourses.filter((c) => c.id !== courseId);
    },

    toggleCourse(course: Course): void {
      if (!course) return;
      const index = this.selectedCourses.findIndex((c) => c.id === course.id);
      if (index !== -1) {
        this.selectedCourses.splice(index, 1);
      } else {
        this.selectedCourses.push(course);
      }
    },

    clearSelectedCourses(): void {
      this.selectedCourses = [];
    },

    setSearchResults(results: Course[] | [-1]): void {
      this.searchResults = Array.isArray(results) ? results : [];
    },

    executeSearch(
      dataset?: Record<string, Record<string, Course>> | null,
      filters?: SearchFilters,
      timeRange?: TimeRangeFilter
    ): Course[] | [-1] {
      this.searchResults = searchCourses(dataset, filters, timeRange);
      return this.searchResults;
    },
  },

  persist: {
    key: "sess_timetable_selected",
    paths: ["selectedCourses"],
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
