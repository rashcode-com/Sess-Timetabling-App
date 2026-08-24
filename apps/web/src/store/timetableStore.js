import { defineStore } from "pinia";
import {
  checkClassTimeInterference,
  checkFinalTimeInterference,
  convertPersianNumToEng,
  toFarsiNumber,
} from "@sess/core";
import { searchCourses } from "../shared/services/courseDataService.js";

export const useTimetableStore = defineStore("timetable", {
  state: () => ({
    selectedCourses: [],
    searchResults: [],
  }),

  getters: {
    selectedList: (state) => state.selectedCourses,
    results: (state) => state.searchResults,
    selectedCount: (state) => state.selectedCourses.length,

    vahedsSumNumber: (state) => {
      let sum = 0;
      for (let i = 0; i < state.selectedCourses.length; i++) {
        const course = state.selectedCourses[i];
        if (course && course.vahed) {
          sum += convertPersianNumToEng(course.vahed);
        }
      }
      return sum;
    },

    vahedsSum: (state) => {
      let sum = 0;
      for (let i = 0; i < state.selectedCourses.length; i++) {
        const course = state.selectedCourses[i];
        if (course && course.vahed) {
          sum += convertPersianNumToEng(course.vahed);
        }
      }
      return toFarsiNumber(sum);
    },

    classTimeConflicts: (state) => {
      const conflicts = [];
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

    finalExamConflicts: (state) => {
      const conflicts = [];
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

    totalConflictCount() {
      return this.classTimeConflicts.length + this.finalExamConflicts.length;
    },

    hasConflicts() {
      return this.totalConflictCount > 0;
    },

    isCourseSelected: (state) => (id) => {
      return state.selectedCourses.some((c) => c.id === id);
    },
  },

  actions: {
    setSelectedCourses(courses) {
      this.selectedCourses = Array.isArray(courses) ? courses : [];
    },

    addCourse(course) {
      if (!course) return;
      if (!this.selectedCourses.some((c) => c.id === course.id)) {
        this.selectedCourses.push(course);
      }
    },

    removeCourse(courseId) {
      this.selectedCourses = this.selectedCourses.filter((c) => c.id !== courseId);
    },

    toggleCourse(course) {
      if (!course) return;
      const index = this.selectedCourses.findIndex((c) => c.id === course.id);
      if (index !== -1) {
        this.selectedCourses.splice(index, 1);
      } else {
        this.selectedCourses.push(course);
      }
    },

    clearSelectedCourses() {
      this.selectedCourses = [];
    },

    setSearchResults(results) {
      this.searchResults = Array.isArray(results) ? results : [];
    },

    executeSearch(dataset, filters, timeRange) {
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
