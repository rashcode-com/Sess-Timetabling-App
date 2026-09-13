import {
  teacherNameDivider,
  toFarsiNumber,
  teacherSearch,
  placeSearchHelper,
  isTimeInBetween,
  normalizeDayName,
} from "@sess/core";
import type {
  Course,
  TimeSlot,
  ProcessedDataset,
  SearchFilters,
  TimeRangeFilter,
  DependentFilterOptions,
} from "../../types";

/**
 * Normalizes an individual course record with strict typing.
 * @param rawCourse - Raw course object from JSON or API.
 * @param courseId - The unique identifier of the course.
 * @returns Normalized Course object.
 */
export function normalizeCourse(rawCourse: any, courseId: string): Course {
  const course: Course = {
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
      (slot: TimeSlot) => ({
        ...slot,
        day: normalizeDayName(slot.day),
        place: slot.place ? toFarsiNumber(slot.place) : "",
      }),
    );
  } else {
    course.seperated_time_and_place = [];
  }

  return course;
}

// Re-export normalizeDayName for backwards compatibility across apps/web
export { normalizeDayName };

/**
 * Processes a raw dataset into a structured, indexed, and deduplicated data model.
 * Automatically detects whether rawData is a UnifiedCatalog or a legacy flat dataset.
 *
 * @param rawData - The raw JSON dataset (UnifiedCatalog or flat departments -> courses).
 * @param targetSemester - Optional semester to select (defaults to active_semester).
 * @returns Processed dataset, course map, list, and deduplicated filter items.
 */
export function processDataset(
  rawData: unknown,
  targetSemester?: string,
): ProcessedDataset {
  if (!rawData || typeof rawData !== "object") {
    return {
      dataset: {},
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
      rawCatalog: null,
    };
  }

  const isUnified =
    "semesters" in rawData && typeof (rawData as any).semesters === "object";
  const rawCatalog = isUnified ? (rawData as any) : null;

  const availableSemesters: string[] =
    isUnified && rawCatalog.semesters
      ? Object.keys(rawCatalog.semesters)
      : ["default"];

  const activeSemester: string = targetSemester
    ? targetSemester
    : isUnified && rawCatalog.active_semester
      ? rawCatalog.active_semester
      : availableSemesters[0] || "default";

  const updatedAt: string | null =
    isUnified && rawCatalog.updated_at ? rawCatalog.updated_at : null;

  const departmentsSource: Record<string, any> =
    isUnified && rawCatalog.semesters
      ? rawCatalog.semesters[activeSemester] || {}
      : (rawData as Record<string, any>);

  const dataset: Record<string, Record<string, Course>> = {};
  const courseList: Course[] = [];
  const courseMap = new Map<string, Course>();

  const unitSet = new Set<string>();
  const courseSet = new Set<string>();
  const teacherSet = new Set<string>();
  const placeSet = new Set<string>();
  const genderSet = new Set<string>();

  for (const [unitName, rawCourses] of Object.entries(departmentsSource)) {
    dataset[unitName] = {};
    unitSet.add(unitName);

    if (rawCourses && typeof rawCourses === "object") {
      for (const [courseKey, rawCourse] of Object.entries(
        rawCourses as Record<string, any>,
      )) {
        const normalized = normalizeCourse(rawCourse, courseKey);

        dataset[unitName][courseKey] = normalized;
        courseList.push(normalized);
        courseMap.set(courseKey, normalized);

        if (normalized.title) {
          courseSet.add(normalized.title);
        }

        if (normalized.teacher) {
          normalized.teacher.split(" | ").forEach((t: string) => {
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
  const sortFa = (set: Set<string>): string[] =>
    Array.from(set).sort(collator.compare);

  const filterOptions = {
    semesters: availableSemesters,
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
    updatedAt,
    activeSemester,
    availableSemesters,
    rawCatalog,
  };
}

/**
 * Executes a deterministic multi-criteria search over the dataset.
 * @param dataset - The normalized hierarchical dataset (unit -> courseKey -> Course).
 * @param filters - The active filter selections.
 * @param timeRange - Optional time range object { timeStart, timeEnd }.
 * @returns Array of matched Course objects (or [-1] if no matches are found).
 */
export function searchCourses(
  dataset?: Record<string, Record<string, Course>> | null,
  filters: SearchFilters = {},
  timeRange: TimeRangeFilter = {},
): Course[] | [-1] {
  if (!dataset) return [-1];

  const {
    unit = [],
    course = [],
    teacherName = [],
    gender = [],
    place = [],
  } = filters;

  const { timeStart = "", timeEnd = "" } = timeRange;

  const results: Course[] = [];

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
        if (
          teacherName.length !== 0 &&
          !teacherSearch(item.teacher, teacherName)
        ) {
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
        if (timeStart.length !== 0 || timeEnd.length !== 0) {
          if (
            !isTimeInBetween(timeStart, timeEnd, item.seperated_time_and_place)
          ) {
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

/**
 * For each filter dimension, recomputes which values are still reachable
 * given the CURRENT selections in the OTHER dimensions. This is what makes
 * filters affect each other: pick "ریاضی" under درس, and نام استاد only
 * lists teachers who actually teach it.
 *
 * Each dimension excludes its OWN current selection when matching, so an
 * already-picked value never disappears from its own list.
 */
export function getDependentFilterOptions(
  dataset: Record<string, Record<string, Course>> | null,
  currentFilters: SearchFilters = {},
): DependentFilterOptions {
  if (!dataset) {
    return { units: [], course: [], teachersName: [], places: [], genders: [] };
  }

  const {
    unit = [],
    course = [],
    teacherName = [],
    gender = [],
    place = [],
  } = currentFilters;

  const matches = (
    item: Course,
    unitName: string,
    skip: keyof SearchFilters,
  ): boolean => {
    if (skip !== "unit" && unit.length && !unit.includes(unitName))
      return false;
    if (skip !== "course" && course.length && !course.includes(item.title))
      return false;
    if (
      skip !== "teacherName" &&
      teacherName.length &&
      !teacherSearch(item.teacher, teacherName)
    )
      return false;
    if (skip !== "gender" && gender.length && !gender.includes(item.gender))
      return false;
    if (skip !== "place" && place.length && !placeSearchHelper(place, item))
      return false;
    return true;
  };

  const unitSet = new Set<string>();
  const courseSet = new Set<string>();
  const teacherSet = new Set<string>();
  const placeSet = new Set<string>();
  const genderSet = new Set<string>();

  for (const [unitName, coursesInUnit] of Object.entries(dataset)) {
    for (const item of Object.values(coursesInUnit)) {
      if (matches(item, unitName, "unit")) unitSet.add(unitName);

      if (matches(item, unitName, "course") && item.title) {
        courseSet.add(item.title);
      }

      if (matches(item, unitName, "teacherName") && item.teacher) {
        item.teacher.split(" | ").forEach((t: string) => {
          const trimmed = t.trim();
          if (trimmed) teacherSet.add(trimmed);
        });
      }

      if (matches(item, unitName, "gender") && item.gender) {
        genderSet.add(item.gender);
      }

      if (matches(item, unitName, "place")) {
        for (const slot of item.seperated_time_and_place) {
          if (slot.place) placeSet.add(slot.place);
        }
      }
    }
  }

  const collator = new Intl.Collator("fa");
  const sortFa = (set: Set<string>) => Array.from(set).sort(collator.compare);

  return {
    units: sortFa(unitSet),
    course: sortFa(courseSet),
    teachersName: sortFa(teacherSet),
    places: sortFa(placeSet),
    genders: sortFa(genderSet),
  };
}

export const courseDataService = {
  normalizeCourse,
  normalizeDayName,
  processDataset,
  searchCourses,
  getDependentFilterOptions,
};

export default courseDataService;
