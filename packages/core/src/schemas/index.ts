import { z } from "zod";

// ---------------------------------------------------------------------------
// TimeSlot — یک بازه زمانی در هفته برای یک درس
// ---------------------------------------------------------------------------
export const TimeSlotSchema = z.object({
  place: z.string(),
  day: z.string(), // نام روز فارسی مثلاً "شنبه"
  startHour: z.number().int().min(0).max(23),
  startMinute: z.number().int().min(0).max(59),
  endHour: z.number().int().min(0).max(23),
  endMinute: z.number().int().min(0).max(59),
});
export type TimeSlot = z.infer<typeof TimeSlotSchema>;

// ---------------------------------------------------------------------------
// FinalTimeSplit — ساعت امتحان پایان‌ترم
// ---------------------------------------------------------------------------
export const FinalTimeSplitSchema = z.object({
  start_hour: z.number().int().min(0).max(23),
  start_minute: z.number().int().min(0).max(59),
  end_hour: z.number().int().min(0).max(23),
  end_minute: z.number().int().min(0).max(59),
});
export type FinalTimeSplit = z.infer<typeof FinalTimeSplitSchema>;

// ---------------------------------------------------------------------------
// FinalDateSplit — تاریخ امتحان به صورت جداگانه (شمسی)
// ---------------------------------------------------------------------------
export const FinalDateSplitSchema = z.object({
  d: z.number().int().min(0),
  m: z.number().int().min(0),
  y: z.number().int().min(0),
});
export type FinalDateSplit = z.infer<typeof FinalDateSplitSchema>;

// ---------------------------------------------------------------------------
// Course — رکورد کامل یک درس از پورتال SESS
// ---------------------------------------------------------------------------
export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  vahed: z.string(),   // تعداد واحد به‌صورت رشته (مثلاً "3")
  group: z.string(),
  teacher: z.string(), // فرمت: "نام‌خانوادگی*نام*بخش(درصد)*"
  gender: z.string(),  // مثلاً "مختلط"
  unit: z.string(),
  time_in_week: z.string(),
  time_room: z.string(),
  midterm_date: z.string(),
  midterm_time: z.string(),
  capacity: z.string(),
  final_time: z.string(),
  final_date: z.string(),
  final_time_split: FinalTimeSplitSchema,
  final_date_split: FinalDateSplitSchema,
  seperated_time_and_place: z.array(TimeSlotSchema),
});
export type Course = z.infer<typeof CourseSchema>;

// ---------------------------------------------------------------------------
// SemesterData — ساختار کلی data.json
// کلید اول: نام بخش/دپارتمان
// کلید دوم: شناسه درس (مثلاً "290331041^1")
// ---------------------------------------------------------------------------
export const SemesterDataSchema = z.record(
  z.string(), // department name
  z.record(
    z.string(), // course id
    CourseSchema
  )
);
export type SemesterData = z.infer<typeof SemesterDataSchema>;
