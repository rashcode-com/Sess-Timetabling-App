import assert from "node:assert/strict";
import fs from "node:fs";
import { setActivePinia, createPinia } from "pinia";
import { useCourseStore } from "../src/store/courseStore.ts";
import { useTimetableStore } from "../src/store/timetableStore.ts";

const rawData = JSON.parse(
  fs.readFileSync(new URL("../src/data/data.json", import.meta.url), "utf-8")
);

console.log("🧪 Running Pinia Stores Modernization Unit Tests...\n");

// 1. Test useCourseStore Initialization & Lookup
{
  setActivePinia(createPinia());
  const courseStore = useCourseStore();

  assert.equal(courseStore.isDataLoaded, false, "Initial isDataLoaded should be false");
  assert.equal(courseStore.courseList.length, 0, "Initial courseList should be empty");

  courseStore.initCourseData(rawData);

  assert.equal(courseStore.isDataLoaded, true, "isDataLoaded should become true");
  assert.ok(courseStore.courseList.length > 0, "courseList should contain courses");
  assert.ok(courseStore.totalCourseCount > 0, "totalCourseCount should match courseList length");
  assert.ok(courseStore.courseMap.size > 0, "courseMap should contain indexed courses");

  // Test getters
  assert.ok(courseStore.semesters.length > 0, "semesters should be populated");
  assert.ok(courseStore.units.length > 0, "units should be populated");
  assert.ok(courseStore.courses.length > 0, "courses should be populated");
  assert.ok(courseStore.teachers.length > 0, "teachers should be populated");
  assert.ok(courseStore.places.length > 0, "places should be populated");
  assert.ok(courseStore.genders.length > 0, "genders should be populated");

  // Test getCourseById
  const sampleCourse = courseStore.courseList[0];
  const foundCourse = courseStore.getCourseById(sampleCourse.id);
  assert.deepEqual(foundCourse, sampleCourse, "getCourseById must retrieve exact matching course");

  console.log(`  ✅ useCourseStore: initCourseData & getters passed (${courseStore.totalCourseCount} courses indexed)`);
}

// 2. Test useTimetableStore Course Selection & CRUD
{
  setActivePinia(createPinia());
  const timetableStore = useTimetableStore();

  assert.equal(timetableStore.selectedCount, 0, "Initial selectedCount should be 0");
  assert.equal(timetableStore.vahedsSum, "۰", "Initial vahedsSum should be '۰'");
  assert.equal(timetableStore.hasConflicts, false, "Initial hasConflicts should be false");

  const course1 = {
    id: "101^1",
    title: "مبانی برنامه‌سازی",
    vahed: "۳",
    teacher: "دکتر الف",
    group: "۱",
    final_date: "1403/03/20",
    final_time: "08:00-10:00",
    final_date_split: { y: 1403, m: 3, d: 20 },
    final_time_split: { start_hour: 8, start_minute: 0, end_hour: 10, end_minute: 0 },
    seperated_time_and_place: [
      { day: "شنبه", startHour: 8, startMinute: 0, endHour: 10, endMinute: 0, place: "101" },
    ],
  };

  const course2 = {
    id: "102^1",
    title: "ریاضی عمومی ۱",
    vahed: "۳",
    teacher: "دکتر ب",
    group: "۱",
    final_date: "1403/03/25",
    final_time: "10:00-12:00",
    final_date_split: { y: 1403, m: 3, d: 25 },
    final_time_split: { start_hour: 10, start_minute: 0, end_hour: 12, end_minute: 0 },
    seperated_time_and_place: [
      { day: "یکشنبه", startHour: 10, startMinute: 0, endHour: 12, endMinute: 0, place: "102" },
    ],
  };

  // Test addCourse
  timetableStore.addCourse(course1);
  assert.equal(timetableStore.selectedCount, 1);
  assert.equal(timetableStore.isCourseSelected("101^1"), true);
  assert.equal(timetableStore.vahedsSum, "۳");
  assert.equal(timetableStore.vahedsSumNumber, 3);

  // Test toggleCourse (add)
  timetableStore.toggleCourse(course2);
  assert.equal(timetableStore.selectedCount, 2);
  assert.equal(timetableStore.vahedsSum, "۶");
  assert.equal(timetableStore.vahedsSumNumber, 6);

  // Test toggleCourse (remove)
  timetableStore.toggleCourse(course2);
  assert.equal(timetableStore.selectedCount, 1);
  assert.equal(timetableStore.isCourseSelected("102^1"), false);

  // Test removeCourse
  timetableStore.removeCourse("101^1");
  assert.equal(timetableStore.selectedCount, 0);
  assert.equal(timetableStore.vahedsSum, "۰");

  // Test setSelectedCourses
  timetableStore.setSelectedCourses([course1, course2]);
  assert.equal(timetableStore.selectedCount, 2);

  // Test clearSelectedCourses
  timetableStore.clearSelectedCourses();
  assert.equal(timetableStore.selectedCount, 0);

  console.log("  ✅ useTimetableStore: CRUD operations & unit calculations passed");
}

// 3. Test useTimetableStore Conflict Detection (Class time & Exam clashes)
{
  setActivePinia(createPinia());
  const timetableStore = useTimetableStore();

  const normalCourse = {
    id: "201^1",
    title: "مدار منطقی",
    vahed: "۳",
    final_date_split: { y: 1403, m: 3, d: 20 },
    final_time_split: { start_hour: 8, start_minute: 0, end_hour: 10, end_minute: 0 },
    seperated_time_and_place: [
      { day: "دوشنبه", startHour: 8, startMinute: 0, endHour: 10, endMinute: 0, place: "101" },
    ],
  };

  const classClashCourse = {
    id: "202^1",
    title: "سیستم‌های عامل",
    vahed: "۳",
    final_date_split: { y: 1403, m: 3, d: 22 },
    final_time_split: { start_hour: 14, start_minute: 0, end_hour: 16, end_minute: 0 },
    seperated_time_and_place: [
      { day: "دوشنبه", startHour: 9, startMinute: 0, endHour: 11, endMinute: 0, place: "102" }, // Overlaps 9-10
    ],
  };

  const examClashCourse = {
    id: "203^1",
    title: "هوش مصنوعی",
    vahed: "۳",
    final_date_split: { y: 1403, m: 3, d: 20 }, // Same exam date
    final_time_split: { start_hour: 8, start_minute: 30, end_hour: 10, end_minute: 30 }, // Overlaps 8:30-10:00
    seperated_time_and_place: [
      { day: "سه‌شنبه", startHour: 14, startMinute: 0, endHour: 16, endMinute: 0, place: "103" },
    ],
  };

  timetableStore.setSelectedCourses([normalCourse, classClashCourse]);
  assert.equal(timetableStore.classTimeConflicts.length, 1, "Should detect 1 class time conflict");
  assert.equal(timetableStore.finalExamConflicts.length, 0, "Should have 0 exam conflicts");
  assert.equal(timetableStore.hasConflicts, true);
  assert.equal(timetableStore.totalConflictCount, 1);

  timetableStore.addCourse(examClashCourse);
  assert.equal(timetableStore.classTimeConflicts.length, 1, "Should retain class time conflict");
  assert.equal(timetableStore.finalExamConflicts.length, 1, "Should detect 1 final exam conflict");
  assert.equal(timetableStore.totalConflictCount, 2);
  assert.equal(timetableStore.hasConflicts, true);

  // Test non-clashing courses on different days with overlapping hours (e.g. Sunday vs Tuesday)
  const sundayCourse = {
    id: "301^1",
    title: "ساختمان داده ها و الگوریتم ها",
    vahed: "۳",
    final_date_split: { y: 1405, m: 4, d: 8 },
    final_time_split: { start_hour: 10, start_minute: 30, end_hour: 12, end_minute: 30 },
    seperated_time_and_place: [
      { day: "یک\u200cشنبه", startHour: 8, startMinute: 30, endHour: 10, endMinute: 30, place: "۲۰۴" },
      { day: "سه\u200cشنبه", startHour: 10, startMinute: 30, endHour: 12, endMinute: 30, place: "۲۰۴" },
    ],
  };

  const tuesdayCourse = {
    id: "302^1",
    title: "اصول سیستم های عامل",
    vahed: "۳",
    final_date_split: { y: 1405, m: 4, d: 20 },
    final_time_split: { start_hour: 10, start_minute: 30, end_hour: 12, end_minute: 30 },
    seperated_time_and_place: [
      { day: "یک\u200cشنبه", startHour: 10, startMinute: 30, endHour: 12, endMinute: 30, place: "۲۰۱" },
      { day: "دوشنبه", startHour: 8, startMinute: 30, endHour: 10, endMinute: 30, place: "۱۰۲" },
    ],
  };

  timetableStore.setSelectedCourses([sundayCourse, tuesdayCourse]);
  assert.equal(timetableStore.classTimeConflicts.length, 0, "Sunday & Tuesday courses should NOT conflict");
  assert.equal(timetableStore.finalExamConflicts.length, 0, "Different exam dates should NOT conflict");
  assert.equal(timetableStore.hasConflicts, false);

  console.log("  ✅ useTimetableStore: Reactive clash detection (class & exam) passed");
}

// 4. Test useTimetableStore Search Execution
{
  setActivePinia(createPinia());
  const courseStore = useCourseStore();
  const timetableStore = useTimetableStore();

  courseStore.initCourseData(rawData);
  const sampleUnit = courseStore.units[0];

  const results = timetableStore.executeSearch(courseStore.rawJson, { unit: [sampleUnit] });
  assert.ok(results.length > 0, "Search should return results");
  assert.deepEqual(timetableStore.searchResults, results, "searchResults should match executeSearch return");

  console.log(`  ✅ useTimetableStore: Search execution passed (${results.length} results returned)`);
}

console.log("\n🎉 ALL PINIA STORES TESTS PASSED SUCCESSFULLY!\n");
