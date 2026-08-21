import {
  teacherNameDivider,
  toFarsiNumber,
  teacherSearch,
  placeSearchHelper,
  isTimeInBetween,
} from "@sess/core";

/**
 * Normalizes an individual course record.
 * @param {Object} rawCourse - The raw course data from JSON/API.
 * @param {string} courseId - The unique identifier of the course.
 * @returns {Object} A cloned and normalized course object.
 */
export function normalizeCourse(rawCourse, courseId) {
  const course = {
    ...rawCourse,
    id: courseId,
  };

  if (course.teacher) {
    course.teacher = teacherNameDivider(course.teacher);
  }

  if (course.vahed !== undefined && course.vahed !== null) {
    course.vahed = toFarsiNumber(course.vahed);
  }

  if (course.group !== undefined && course.group !== null) {
    course.group = toFarsiNumber(course.group);
  }

  if (course.time_room !== undefined && course.time_room !== null) {
    course.time_room = toFarsiNumber(course.time_room);
  }

  if (typeof course.unit === "string") {
    // SESS unit format cleanup: remove trailing delimiter and replace '*' with '|'
    course.unit = course.unit.slice(0, -1).replaceAll("*", "|");
  }

  if (Array.isArray(course.seperated_time_and_place)) {
    course.seperated_time_and_place = course.seperated_time_and_place.map(
      (slot) => ({
        ...slot,
        place: slot.place ? toFarsiNumber(slot.place) : "",
      })
    );
  } else {
    course.seperated_time_and_place = [];
  }

  return course;
}

/**
 * Processes a raw dataset into a structured, indexed, and deduplicated data model.
 * @param {Object} rawData - The raw JSON dataset (departments -> courses).
 * @returns {Object} Processed dataset, course map, list, and deduplicated filter items.
 */
export function processDataset(rawData) {
  if (!rawData || typeof rawData !== "object") {
    return {
      dataset: {},
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
    };
  }

  const dataset = {};
  const courseList = [];
  const courseMap = new Map();

  const unitSet = new Set();
  const courseSet = new Set();
  const teacherSet = new Set();
  const placeSet = new Set();
  const genderSet = new Set();

  for (const [unitName, rawCourses] of Object.entries(rawData)) {
    dataset[unitName] = {};
    unitSet.add(unitName);

    if (rawCourses && typeof rawCourses === "object") {
      for (const [courseKey, rawCourse] of Object.entries(rawCourses)) {
        const normalized = normalizeCourse(rawCourse, courseKey);

        dataset[unitName][courseKey] = normalized;
        courseList.push(normalized);
        courseMap.set(courseKey, normalized);

        if (normalized.title) {
          courseSet.add(normalized.title);
        }

        if (normalized.teacher) {
          normalized.teacher.split(" | ").forEach((t) => {
            const trimmed = t.trim();
            if (trimmed) {
              teacherSet.add(trimmed);
            }
          });
        }

        if (normalized.gender) {
          genderSet.add(normalized.gender);
        }

        for (const slot of normalized.seperated_time_and_place) {
          if (slot.place) {
            placeSet.add(slot.place);
          }
        }
      }
    }
  }

  const collator = new Intl.Collator("fa");
  const sortFa = (set) => Array.from(set).sort(collator.compare);

  const filterOptions = {
    semesters: ["1402-1"],
    units: sortFa(unitSet),
    course: sortFa(courseSet),
    teachersName: sortFa(teacherSet),
    times: [],
    places: sortFa(placeSet),
    genders: sortFa(genderSet),
  };

  return {
    dataset,
    courseList,
    courseMap,
    filterOptions,
  };
}

/**
 * Executes a deterministic multi-criteria search over the dataset.
 * @param {Object} dataset - The normalized hierarchical dataset (unit -> courseKey -> Course).
 * @param {Object} filters - The active filter selections.
 * @param {Object} [timeRange] - Optional time range object { timeStart, timeEnd }.
 * @returns {Array} Array of matched Course objects (or [-1] if no matches are found).
 */
export function searchCourses(dataset, filters = {}, timeRange = {}) {
  if (!dataset) return [-1];

  const {
    unit = [],
    course = [],
    teacherName = [],
    gender = [],
    place = [],
  } = filters;

  const { timeStart = "", timeEnd = "" } = timeRange;

  const results = [];

  for (const unitName in dataset) {
    if (unit.length === 0 || unit.includes(unitName)) {
      const coursesInUnit = dataset[unitName];
      for (const courseKey in coursesInUnit) {
        const item = coursesInUnit[courseKey];

        // 1. Course title filter
        if (course.length !== 0 && !course.includes(item.title)) {
          continue;
        }

        // 2. Teacher name filter
        if (teacherName.length !== 0 && !teacherSearch(item.teacher, teacherName)) {
          continue;
        }

        // 3. Gender filter
        if (gender.length !== 0 && !gender.includes(item.gender)) {
          continue;
        }

        // 4. Place filter
        if (place.length !== 0 && !placeSearchHelper(place, item)) {
          continue;
        }

        // 5. Time range filter
        if (
          timeStart.length !== 0 ||
          timeEnd.length !== 0
        ) {
          if (!isTimeInBetween(timeStart, timeEnd, item.seperated_time_and_place)) {
            continue;
          }
        }

        results.push(item);
      }
    }
  }

  if (results.length === 0) {
    return [-1];
  }

  return results;
}

export const courseDataService = {
  normalizeCourse,
  processDataset,
  searchCourses,
};

export default courseDataService;
