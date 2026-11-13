import type { SpendingGranularity, SpendingRange, SpendingRangeShortcut } from './spending-tracker-types.js';

/** Au-delà, la plage est regroupée par semaine. */
const MAX_DAYS_FOR_DAY_GRANULARITY = 31;
/** Au-delà, la plage est regroupée par mois (26 semaines). */
const MAX_DAYS_FOR_WEEK_GRANULARITY = 26 * 7;

const CALENDAR_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function fromIso(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isCalendarDay(value: string): boolean {
  if (!CALENDAR_DAY_PATTERN.test(value)) return false;
  const date = fromIso(value);
  return !Number.isNaN(date.getTime()) && toIso(date) === value;
}

export function isValidRange({ from, to }: SpendingRange): boolean {
  return isCalendarDay(from) && isCalendarDay(to) && from <= to;
}

/** Jour calendaire local (navigateur) au format YYYY-MM-DD. */
export function todayIso({ now = new Date() }: { now?: Date } = {}): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays({ day, days }: { day: string; days: number }): string {
  const date = fromIso(day);
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
}

/** Lundi de la semaine du jour donné. */
export function startOfWeek({ day }: { day: string }): string {
  const daysSinceMonday = (fromIso(day).getUTCDay() + 6) % 7;
  return addDays({ day, days: -daysSinceMonday });
}

export function startOfMonth({ day }: { day: string }): string {
  return `${day.slice(0, 7)}-01`;
}

export function rangeForShortcut({
  shortcut,
  today,
}: {
  shortcut: SpendingRangeShortcut;
  today: string;
}): SpendingRange {
  switch (shortcut) {
    case 'today':
      return { from: today, to: today };
    case 'week':
      return { from: startOfWeek({ day: today }), to: today };
    case 'month':
      return { from: startOfMonth({ day: today }), to: today };
  }
}

export function daysInRange({ from, to }: SpendingRange): number {
  return Math.round((fromIso(to).getTime() - fromIso(from).getTime()) / 86_400_000) + 1;
}

/** Jusqu'à 31 jours : par jour ; jusqu'à 26 semaines : par semaine ; au-delà : par mois. */
export function granularityForRange(range: SpendingRange): SpendingGranularity {
  const days = daysInRange(range);
  if (days <= MAX_DAYS_FOR_DAY_GRANULARITY) return 'day';
  if (days <= MAX_DAYS_FOR_WEEK_GRANULARITY) return 'week';
  return 'month';
}
