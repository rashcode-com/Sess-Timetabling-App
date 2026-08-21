import { getField, updateField } from "vuex-map-fields";
import { processDataset } from "@/shared/services/courseDataService";
import rawData from "@/data/data.json";

const state = {
  results: [],

  filters: {
    semester: "",
    unit: [],
    course: [],
    teacherName: [],
    time: [],
    place: [],
    gender: [],
  },

  filtersItems: {
    semesters: ["1402-1"],
    units: [],
    course: [],
    teachersName: [],
    times: [],
    places: [],
    genders: [],
  },

  json: null,
  courseList: [],
  // NOTE (Vue 2 Reactivity): ES6 Map methods (.set/.delete) are not tracked by Vue 2's Object.defineProperty.
  // courseMap is an immutable read-only lookup index (replaced wholesale via SET_COURSE_DATA).
  // Do NOT mutate courseMap in-place inside components until Vue 3 / Pinia (Phase G & H).
  courseMap: new Map(),
  isDataLoaded: false,
};

const getters = {
  getField,
  getFilterItems: (state) => state.filtersItems,
  getSemesters: (state) => state.filtersItems.semesters,
  getUnits: (state) => state.filtersItems.units,
  getCourses: (state) => state.filtersItems.course,
  getTeachers: (state) => state.filtersItems.teachersName,
  getPlaces: (state) => state.filtersItems.places,
  getGenders: (state) => state.filtersItems.genders,
  getJson: (state) => state.json,
  getCourseList: (state) => state.courseList,
  getCourseById: (state) => (id) => state.courseMap.get(id),
  isDataLoaded: (state) => state.isDataLoaded,
};

const mutations = {
  updateField,
  SET_COURSE_DATA(state, { dataset, filterOptions, courseList, courseMap }) {
    state.json = dataset;
    state.filtersItems = filterOptions;
    state.courseList = courseList;
    state.courseMap = courseMap;
    state.isDataLoaded = true;
  },
  SET_RESULTS(state, results) {
    state.results = results;
  },
};

const actions = {
  initCourseData({ commit, state }, customData) {
    if (state.isDataLoaded && !customData) {
      return;
    }
    const dataToProcess = customData || rawData;
    const processed = processDataset(dataToProcess);
    commit("SET_COURSE_DATA", processed);
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};

