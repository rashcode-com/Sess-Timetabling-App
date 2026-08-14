import assert from 'node:assert/strict';
import {
  arabicToPersian,
  convertIfPersianToEng,
  seperateTimeAndPlace,
  parseFinalTime,
  parseFinalDate,
  buildCourseRecord,
} from '../src/parser.js';
import { SemesterDataSchema } from '@sess/core';

console.log('🧪 Running Crawler Parser Unit Tests...');

// 1. Test arabicToPersian
{
  const input = 'كلاس رياضي 123 و فيزيك ٤٥٦';
  const expected = 'کلاس ریاضی ۱۲۳ و فیزیک ۴۵۶';
  const result = arabicToPersian(input);
  assert.equal(result, expected, `arabicToPersian failed: ${result} !== ${expected}`);
  console.log('  ✅ arabicToPersian passed');
}

// 2. Test convertIfPersianToEng
{
  assert.equal(convertIfPersianToEng('۱۴'), 14);
  assert.equal(convertIfPersianToEng('٠٨'), 8);
  assert.equal(convertIfPersianToEng('123'), 123);
  assert.equal(convertIfPersianToEng('کد درس: ۱۲۳۴'), 1234);
  assert.equal(convertIfPersianToEng(''), 0);
  console.log('  ✅ convertIfPersianToEng passed');
}

// 3. Test seperateTimeAndPlace
{
  const rawTimeRoom = 'دوشنبه-08:00:10:00(کلاس 101)\nچهارشنبه-10:00:12:00(کلاس 102)';
  const slots = seperateTimeAndPlace(rawTimeRoom);
  assert.equal(slots.length, 2);
  assert.deepEqual(slots[0], {
    place: 'کلاس 101',
    day: 'دوشنبه',
    startHour: 8,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
  });
  assert.deepEqual(slots[1], {
    place: 'کلاس 102',
    day: 'چهارشنبه',
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
  });
  console.log('  ✅ seperateTimeAndPlace passed');
}

// 4. Test parseFinalTime
{
  const finalTime = '08:30-10:30';
  const parsed = parseFinalTime(finalTime);
  assert.deepEqual(parsed, {
    start_hour: 8,
    start_minute: 30,
    end_hour: 10,
    end_minute: 30,
  });
  console.log('  ✅ parseFinalTime passed');
}

// 5. Test parseFinalDate
{
  const finalDate = '1403/03/25';
  const parsed = parseFinalDate(finalDate);
  assert.deepEqual(parsed, {
    y: 1403,
    m: 3,
    d: 25,
  });
  console.log('  ✅ parseFinalDate passed');
}

// 6. Test buildCourseRecord & schema validation
{
  const rawInputs = {
    edName: 'برنامه‌سازی پيشرفته',
    edTotalUnit: '3',
    edGroup: '1',
    edTch: 'احمدي*علي*مهندسي كامپيوتر(100)*',
    edSex: 'مختلط',
    edUnit: '3',
    edTimeInWeek: '3',
    edTimeRoom: 'دوشنبه-08:00:10:00(101)',
    edMidDate: '',
    edMidTime: '',
    edCapacity: '40',
    edSrl: '290331041',
    edFinalTime: '08:00-10:00',
    edFinalDate: '1403/03/25',
  };

  const { compositeId, course } = buildCourseRecord(rawInputs);
  assert.equal(compositeId, '290331041^1');
  assert.equal(course.title, 'برنامه‌سازی پیشرفته');
  assert.equal(course.capacity, '۴۰');
  assert.equal(course.teacher, 'احمدی*علی*مهندسی کامپیوتر(۱۰۰)*');
  assert.equal(course.vahed, '3');
  assert.equal(course.group, '1');
  assert.equal(course.final_date_split.y, 1403);
  assert.equal(course.final_time_split.start_hour, 8);
  assert.equal(course.seperated_time_and_place.length, 1);

  // Validate entire SemesterData structure
  const sampleSemesterData = {
    'مهندسی کامپیوتر': {
      [compositeId]: course,
    },
  };
  SemesterDataSchema.parse(sampleSemesterData);
  console.log('  ✅ buildCourseRecord & SemesterDataSchema passed');
}

console.log('\n🎉 ALL PARSER UNIT TESTS PASSED SUCCESSFULLY!\n');
