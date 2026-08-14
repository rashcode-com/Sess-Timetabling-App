import { Course, CourseSchema, FinalDateSplit, FinalTimeSplit, TimeSlot } from '@sess/core';

const CHAR_MAPPING: Record<string, string> = {
  'ك': 'ک',
  'دِ': 'د',
  'بِ': 'ب',
  'زِ': 'ز',
  'ذِ': 'ذ',
  'شِ': 'ش',
  'سِ': 'س',
  'ى': 'ی',
  'ي': 'ی',
  // Arabic digits to Persian
  '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴', '٥': '۵',
  '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹', '٠': '۰',
  // ASCII English digits to Persian
  '1': '۱', '2': '۲', '3': '۳', '4': '۴', '5': '۵',
  '6': '۶', '7': '۷', '8': '۸', '9': '۹', '0': '۰',
};

const PERSIAN_DIGIT_MAP: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

/**
 * Normalizes Arabic characters and converts all digits to Persian (۰-۹) exactly like legacy crawler.
 */
export function arabicToPersian(text: string): string {
  if (!text) return '';
  const str = String(text);
  const regex = new RegExp(Object.keys(CHAR_MAPPING).join('|'), 'g');
  return str.replace(regex, (match) => CHAR_MAPPING[match] || match);
}

/**
 * Converts Persian/Arabic numeral string into ASCII integer (e.g. '۱۴' -> 14).
 */
export function convertIfPersianToEng(numberInString: string): number {
  if (!numberInString) return 0;
  const str = String(numberInString);
  let cleaned = '';
  for (const char of str) {
    if (PERSIAN_DIGIT_MAP[char] !== undefined) {
      cleaned += PERSIAN_DIGIT_MAP[char];
    } else {
      cleaned += char;
    }
  }
  const digits = cleaned.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Parses formatted weekly timetable strings into structured schedule records.
 */
export function seperateTimeAndPlace(timeAndDate: string): TimeSlot[] {
  if (!timeAndDate) return [];

  // Remove newlines and extract places inside parentheses
  let justDateAndTime = timeAndDate.replace(/\n/g, '');
  const places = justDateAndTime.match(/\(.*?\)/g) || [];
  justDateAndTime = justDateAndTime.replace(/ /g, '');

  // Replace parenthesized places with a space, then split by space
  const segments = justDateAndTime
    .replace(/\(.*?\)/g, ' ')
    .split(' ')
    .slice(0, -1);

  const courseSchedule: TimeSlot[] = [];

  for (let i = 0; i < segments.length; i++) {
    try {
      const seg = segments[i];
      if (!seg) continue;

      const rawPlace = places[i] ? places[i].replace(/[()]/g, '') : '';
      const seperated = seg.split('-');
      if (seperated.length < 2) continue;

      const day = seperated[0];
      const seperatedTimes = seperated[1].split(':');
      if (seperatedTimes.length < 4) continue;

      const timeSlot: TimeSlot = {
        place: rawPlace,
        day,
        startHour: convertIfPersianToEng(seperatedTimes[0]),
        startMinute: convertIfPersianToEng(seperatedTimes[1]),
        endHour: convertIfPersianToEng(seperatedTimes[2]),
        endMinute: convertIfPersianToEng(seperatedTimes[3]),
      };

      courseSchedule.push(timeSlot);
    } catch {
      continue;
    }
  }

  return courseSchedule;
}

/**
 * Parses final exam time into { start_hour, start_minute, end_hour, end_minute }.
 */
export function parseFinalTime(finalTime: string): FinalTimeSplit {
  try {
    const splitedTime = finalTime.replace(/ /g, '').split('-');
    const splitedTimeStart = (splitedTime[0] || '').split(':');
    const splitedTimeEnd = (splitedTime[1] || '').split(':');

    return {
      start_hour: convertIfPersianToEng(splitedTimeStart[0] || ''),
      start_minute: convertIfPersianToEng(splitedTimeStart[1] || ''),
      end_hour: convertIfPersianToEng(splitedTimeEnd[0] || ''),
      end_minute: convertIfPersianToEng(splitedTimeEnd[1] || ''),
    };
  } catch {
    return { start_hour: 0, start_minute: 0, end_hour: 0, end_minute: 0 };
  }
}

/**
 * Parses final exam date into { d, m, y }.
 */
export function parseFinalDate(finalDate: string): FinalDateSplit {
  try {
    const splitedDate = finalDate.split('/');
    return {
      y: convertIfPersianToEng(splitedDate[0] || ''),
      m: convertIfPersianToEng(splitedDate[1] || ''),
      d: convertIfPersianToEng(splitedDate[2] || ''),
    };
  } catch {
    return { d: 0, m: 0, y: 0 };
  }
}

/**
 * Builds and validates a complete Course object matching @sess/core schemas
 * from raw SESS element values.
 */
export function buildCourseRecord(rawInputs: Record<string, string>): { compositeId: string; course: Course } {
  const title = arabicToPersian(rawInputs.edName || '');
  const teacher = arabicToPersian(rawInputs.edTch || '');
  const gender = arabicToPersian(rawInputs.edSex || '');
  const unit = arabicToPersian(rawInputs.edUnit || '');
  const timeInWeek = arabicToPersian(rawInputs.edTimeInWeek || '');
  const timeRoom = arabicToPersian(rawInputs.edTimeRoom || '');
  const capacity = arabicToPersian(rawInputs.edCapacity || '');

  const vahed = rawInputs.edTotalUnit || '';
  const group = rawInputs.edGroup || '';
  const midtermDate = rawInputs.edMidDate || '';
  const midtermTime = rawInputs.edMidTime || '';
  const finalTime = rawInputs.edFinalTime || '';
  const finalDate = rawInputs.edFinalDate || '';

  const rawSrl = rawInputs.edSrl || '';
  const compositeId = `${rawSrl}^${group}`;

  const finalTimeSplit = parseFinalTime(finalTime);
  const finalDateSplit = parseFinalDate(finalDate);
  const seperatedTimeAndPlace = seperateTimeAndPlace(timeRoom);

  const courseData: Course = {
    id: compositeId,
    title,
    vahed,
    group,
    teacher,
    gender,
    unit,
    time_in_week: timeInWeek,
    time_room: timeRoom,
    midterm_date: midtermDate,
    midterm_time: midtermTime,
    capacity,
    final_time: finalTime,
    final_date: finalDate,
    final_time_split: finalTimeSplit,
    final_date_split: finalDateSplit,
    seperated_time_and_place: seperatedTimeAndPlace,
  };

  // Validate course schema
  const parsedCourse = CourseSchema.parse(courseData);
  return { compositeId, course: parsedCourse };
}

