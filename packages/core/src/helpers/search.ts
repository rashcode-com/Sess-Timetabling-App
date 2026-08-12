import type { Course } from '../schemas/index.js';

/**
 * Checks if any place associated with a course matches any of the requested places.
 */
export function placeSearchHelper(places: string[], course: Course): boolean {
  const timeAndPlace = course.seperated_time_and_place || [];
  const arr: string[] = [];
  for (const item of timeAndPlace) {
    if (item.place) {
      arr.push(item.place);
    }
  }
  for (const place of arr) {
    if (places.includes(place)) {
      return true;
    }
  }
  return false;
}

/**
 * Formats a raw SESS teacher name string (delimited by '*') into a human-readable name.
 */
export function teacherNameDivider(raw: string): string {
  const parts = raw.split('*');
  let result: string[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i] !== undefined && parts[i + 1] !== undefined) {
      result.push([parts[i + 1], parts[i]].join(' '));
    }
  }

  if (result.length > 1) {
    let joined = result.join(' | ');
    return joined.substring(0, joined.length - 3);
  } else {
    return result[0] || raw;
  }
}

/**
 * Checks whether a teacher string includes any of the specified filter options.
 */
export function teacherSearch(str: string, listOfOptions: string[]): boolean {
  for (let i = 0; i < listOfOptions.length; i++) {
    if (str.includes(listOfOptions[i])) {
      return true;
    }
  }
  return false;
}
