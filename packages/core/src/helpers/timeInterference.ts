import type { Course } from "../schemas/index.js";
import { normalizeDayName } from "./normalizers.js";

/**
 * Checks whether two courses have overlapping weekly class time slots.
 */
export function checkClassTimeInterference(course1: Course, course2: Course): boolean {
  const c1Time = course1.seperated_time_and_place;
  const c2Time = course2.seperated_time_and_place;

  for (const slot1 of c1Time) {
    for (const slot2 of c2Time) {
      const day1 = normalizeDayName(slot1.day);
      const day2 = normalizeDayName(slot2.day);

      if (!day1 || !day2 || day1 !== day2) {
        continue;
      }

      const c1Start = new Date(2000, 1, 0, slot1.startHour, slot1.startMinute);
      const c2Start = new Date(2000, 1, 0, slot2.startHour, slot2.startMinute);
      const c1End   = new Date(2000, 1, 0, slot1.endHour,   slot1.endMinute);
      const c2End   = new Date(2000, 1, 0, slot2.endHour,   slot2.endMinute);

      if (
        (c1Start > c2Start && c1Start < c2End) ||
        (c1End   < c2End   && c1End   > c2Start) ||
        (c1Start <= c2Start && c1End  >= c2End)
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks whether two courses have overlapping final exam time slots.
 */
export function checkFinalTimeInterference(course1: Course, course2: Course): boolean {
  const d1 = course1.final_date_split;
  const d2 = course2.final_date_split;
  const t1 = course1.final_time_split;
  const t2 = course2.final_time_split;

  const day1 = new Date(d1.y, d1.m, d1.d);
  const day2 = new Date(d2.y, d2.m, d2.d);

  if (day1.getTime() !== day2.getTime()) return false;

  const c1Start = new Date(d1.y, d1.m, d1.d, t1.start_hour, t1.start_minute);
  const c2Start = new Date(d2.y, d2.m, d2.d, t2.start_hour, t2.start_minute);
  const c1End   = new Date(d1.y, d1.m, d1.d, t1.end_hour,   t1.end_minute);
  const c2End   = new Date(d2.y, d2.m, d2.d, t2.end_hour,   t2.end_minute);

  // Skip if exam time is 00:00-00:00 (not set)
  if (
    (c1Start.getHours() === 0 && c1Start.getMinutes() === 0 && c1End.getHours() === 0 && c1End.getMinutes() === 0) ||
    (c2Start.getHours() === 0 && c2Start.getMinutes() === 0 && c2End.getHours() === 0 && c2End.getMinutes() === 0)
  ) return false;

  return (
    (c1Start > c2Start && c1Start < c2End) ||
    (c1End   < c2End   && c1End   > c2Start) ||
    (c1Start <= c2Start && c1End  >= c2End)
  );
}
