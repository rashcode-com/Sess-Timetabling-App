import type { TimeSlot } from "../schemas/index.js";

/**
 * Returns true if any slot in `slots` falls entirely within [startTime, endTime].
 *
 * @param startTime - "HH:MM" string
 * @param endTime   - "HH:MM" string
 * @param slots     - array of TimeSlot objects
 */
export function isTimeInBetween(
  startTime: string,
  endTime: string,
  slots: TimeSlot[]
): boolean {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const rangeStart = new Date(2000, 0, 1, startH, startM);
  const rangeEnd   = new Date(2000, 0, 1, endH, endM);

  for (const slot of slots) {
    const slotStart = new Date(2000, 0, 1, slot.startHour, slot.startMinute);
    const slotEnd   = new Date(2000, 0, 1, slot.endHour, slot.endMinute);
    if (rangeStart <= slotStart && slotEnd <= rangeEnd) return true;
  }
  return false;
}
