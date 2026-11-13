/**
 * Calcul calendaire en heure de Paris.
 * Un jour calendaire est représenté par une chaîne "YYYY-MM-DD".
 */
const TIME_ZONE = "Europe/Paris";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const CALENDAR_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDay(value: string): boolean {
  if (!CALENDAR_DAY_PATTERN.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && toIso(date) === value;
}

function toIso(utcDate: Date): string {
  return utcDate.toISOString().slice(0, 10);
}

function fromIso(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

/** Jour calendaire parisien d'un instant */
function parisDayOf(instant: Date): string {
  return dayFormatter.format(instant);
}

function parisOffsetMs(instant: Date): number {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(instant).map((p) => [p.type, p.value])
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Instant correspondant à minuit, heure de Paris, du jour donné */
function parisMidnight(day: string): Date {
  const utcMidnight = fromIso(day).getTime();
  const firstGuess = utcMidnight - parisOffsetMs(new Date(utcMidnight));
  return new Date(utcMidnight - parisOffsetMs(new Date(firstGuess)));
}

function addDays(day: string, days: number): string {
  const date = fromIso(day);
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
}

function addMonths(day: string, months: number): string {
  const date = fromIso(day);
  date.setUTCMonth(date.getUTCMonth() + months);
  return toIso(date);
}

/** Lundi de la semaine du jour donné */
function startOfWeek(day: string): string {
  const weekday = fromIso(day).getUTCDay(); // 0 = dimanche
  const daysSinceMonday = (weekday + 6) % 7;
  return addDays(day, -daysSinceMonday);
}

function startOfMonth(day: string): string {
  return `${day.slice(0, 7)}-01`;
}

export default {
  isCalendarDay,
  parisDayOf,
  parisMidnight,
  addDays,
  addMonths,
  startOfWeek,
  startOfMonth,
};
