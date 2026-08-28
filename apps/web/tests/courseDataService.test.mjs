import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  normalizeCourse,
  processDataset,
  searchCourses,
} from '../src/shared/services/courseDataService.ts';

const rawData = JSON.parse(
  fs.readFileSync(new URL('../src/data/data.json', import.meta.url), 'utf-8')
);

console.log('🧪 Running CourseDataService ETL & Search Unit Tests...\n');

// 1. Test normalizeCourse single record
{
  const rawSample = {
    title: 'ساختمان داده‌ها',
    vahed: '3',
    group: '1',
    teacher: 'رضايي*علي*مهندسي كامپيوتر(100)*',
    gender: 'مختلط',
    unit: 'مهندسي كامپيوتر*',
    time_in_week: '3',
    time_room: 'شنبه-08:00:10:00(101)',
    midterm_date: '',
    midterm_time: '',
    capacity: '40',
    final_time: '08:00-10:00',
    final_date: '1403/03/20',
    final_time_split: { start_hour: 8, start_minute: 0, end_hour: 10, end_minute: 0 },
    final_date_split: { y: 1403, m: 3, d: 20 },
    seperated_time_and_place: [
      { place: '101', day: 'شنبه', startHour: 8, startMinute: 0, endHour: 10, endMinute: 0 }
    ]
  };

  const normalized = normalizeCourse(rawSample, '290331041^1');

  assert.equal(normalized.id, '290331041^1');
  assert.equal(normalized.vahed, '۳');
  assert.equal(normalized.group, '۱');
  assert.equal(normalized.time_room, 'شنبه-۰۸:۰۰:۱۰:۰۰(۱۰۱)');
  assert.equal(normalized.unit, 'مهندسي كامپيوتر');
  assert.equal(normalized.teacher, 'علي رضايي');
  assert.equal(normalized.seperated_time_and_place[0].place, '۱۰۱');
  console.log('  ✅ normalizeCourse unit test passed');

  // Test multi-teacher course formatting (prevent truncation)
  const multiTeacherSample = {
    title: 'شبیه سازی پیشرفته',
    teacher: 'احمدی*کامبیز*علوم کامپیوتر(۵۰)*احراری*وحیده*علوم کامپیوتر(۵۰)*',
  };
  const normalizedMulti = normalizeCourse(multiTeacherSample, '190140016^1');
  assert.equal(normalizedMulti.teacher, 'کامبیز احمدی | وحیده احراری');
  console.log('  ✅ normalizeCourse multi-teacher test passed');
}

// 2. Test processDataset deduplication and indexing
{
  const startTime = performance.now();
  const result = processDataset(rawData);
  const duration = performance.now() - startTime;

  assert.ok(result.dataset, 'Dataset must be present');
  assert.ok(result.courseList.length > 0, 'CourseList must contain courses');
  assert.ok(result.courseMap.size > 0, 'CourseMap must contain indexed courses');
  assert.equal(result.courseList.length, result.courseMap.size, 'CourseList length must match CourseMap size');

  const { filterOptions } = result;
  
  // Verify deduplication
  const uniqueUnits = new Set(filterOptions.units);
  assert.equal(filterOptions.units.length, uniqueUnits.size, 'Units list must contain NO duplicates');

  const uniqueCourses = new Set(filterOptions.course);
  assert.equal(filterOptions.course.length, uniqueCourses.size, 'Courses list must contain NO duplicates');

  const uniqueTeachers = new Set(filterOptions.teachersName);
  assert.equal(filterOptions.teachersName.length, uniqueTeachers.size, 'Teachers list must contain NO duplicates');

  const uniquePlaces = new Set(filterOptions.places);
  assert.equal(filterOptions.places.length, uniquePlaces.size, 'Places list must contain NO duplicates');

  const uniqueGenders = new Set(filterOptions.genders);
  assert.equal(filterOptions.genders.length, uniqueGenders.size, 'Genders list must contain NO duplicates');

  console.log(`  ✅ processDataset ETL passed (${result.courseList.length} courses indexed in ${duration.toFixed(2)}ms)`);
  console.log(`     - Unique Units: ${filterOptions.units.length}`);
  console.log(`     - Unique Courses: ${filterOptions.course.length}`);
  console.log(`     - Unique Teachers: ${filterOptions.teachersName.length}`);
  console.log(`     - Unique Places: ${filterOptions.places.length}`);
  console.log(`     - Unique Genders: ${filterOptions.genders.length}`);
}

// 3. Test searchCourses engine
{
  const { dataset, filterOptions } = processDataset(rawData);
  const sampleUnit = filterOptions.units[0];

  // Search by unit
  const unitCourses = searchCourses(dataset, { unit: [sampleUnit] });
  assert.ok(unitCourses.length > 0, `Should find courses for unit: ${sampleUnit}`);
  assert.notEqual(unitCourses[0], -1);

  // Search with empty results -> returns [-1]
  const nonExistent = searchCourses(dataset, { unit: ['بخش_ناموجود_تستی_۱۲۳۴۵'] });
  assert.deepEqual(nonExistent, [-1], 'Should return [-1] when no courses found');

  // Search by multi-criteria (unit + course title)
  const firstCourseTitle = unitCourses[0].title;
  const multiSearch = searchCourses(dataset, {
    unit: [sampleUnit],
    course: [firstCourseTitle],
  });
  assert.ok(multiSearch.length > 0);
  assert.notEqual(multiSearch[0], -1);
  assert.equal(multiSearch[0].title, firstCourseTitle);

  console.log(`  ✅ searchCourses engine tests passed (tested with unit: "${sampleUnit}", course: "${firstCourseTitle}")`);
}

console.log('\n🎉 ALL COURSEDATA SERVICE TESTS PASSED SUCCESSFULLY!\n');
