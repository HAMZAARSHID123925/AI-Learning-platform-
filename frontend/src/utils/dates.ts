import { addDays, differenceInCalendarDays, format, startOfToday } from 'date-fns';

export function dateFromOffset(offset: number): Date {
  return addDays(startOfToday(), offset);
}

export function offsetFromDate(date: Date): number {
  return differenceInCalendarDays(date, startOfToday());
}

export function relativeDayLabel(offset: number): string {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  return format(dateFromOffset(offset), 'EEEE');
}

/** "10:30 AM" -> minutes since midnight, for sorting */
export function timeToMinutes(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let h = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(match[2]);
}

/** "14:30" (input[type=time]) -> "2:30 PM" */
export function formatTime24(value: string): string {
  const [hStr, m] = value.split(':');
  const h = Number(hStr);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${suffix}`;
}