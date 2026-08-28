import type { Course, TimeSlot } from "@sess/core";

export type { Course, TimeSlot };

/**
 * Filter options populated dynamically from dataset ETL
 */
export interface FilterOptions {
  semesters: string[];
  units: string[];
  course: string[];
  teachersName: string[];
  times: string[];
  places: string[];
  genders: string[];
}

/**
 * Search filter query parameters
 */
export interface SearchFilters {
  semester?: string;
  unit?: string[];
  course?: string[];
  teacherName?: string[];
  place?: string[];
  gender?: string[];
}

/**
 * Time range filter query parameters
 */
export interface TimeRangeFilter {
  timeStart?: string;
  timeEnd?: string;
}

/**
 * Processed dataset model returned by courseDataService.processDataset
 */
export interface ProcessedDataset {
  dataset: Record<string, Record<string, Course>>;
  courseList: Course[];
  courseMap: Map<string, Course>;
  filterOptions: FilterOptions;
}

/**
 * Conflicting course pair [Course A, Course B]
 */
export type CourseConflictPair = [Course, Course];

/**
 * Calendar event model formatted for weekly timetable visualization
 */
export interface CalendarEvent {
  id: string;
  name: string;
  teacher: string;
  group: string;
  day: string;
  room: string;
  final_date: string;
  final_time: string;
  rawColor: string;
  startMin: number;
  endMin: number;
  durationMin: number;
  timeText: string;
  colIndex?: number;
  totalCols?: number;
  widthPercent?: number;
  rightPercent?: number;
}

/**
 * Search event payload emitted by FilterDrawer to orchestrator
 */
export interface SearchEventPayload {
  filters: {
    semester: string;
    unit: string[];
    course: string[];
    teacherName: string[];
    place: string[];
    gender: string[];
  };
  timeRange: {
    timeStart: string;
    timeEnd: string;
  };
}
