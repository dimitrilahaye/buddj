/**
 * Sélection d'une plage dans un calendrier unique, à la Airbnb :
 * un premier clic pose le début, un second la fin ; valider sans fin = un seul jour.
 */
import { addDays, startOfMonth, startOfWeek } from './spending-tracker-range.js';
import type { SpendingRange } from './spending-tracker-types.js';

export type DateRangeSelection = { start: string | null; end: string | null };

export const EMPTY_SELECTION: DateRangeSelection = { start: null, end: null };

/** Reprend une plage existante : un seul jour se lit comme un début sans fin. */
export function selectionFromRange({ from, to }: SpendingRange): DateRangeSelection {
  return { start: from, end: to === from ? null : to };
}

/**
 * - pas de début, ou plage complète : le jour devient un nouveau début ;
 * - début seul : un jour postérieur fixe la fin, un jour antérieur remplace le début.
 */
export function pickDay({ selection, day }: { selection: DateRangeSelection; day: string }): DateRangeSelection {
  const { start, end } = selection;
  if (start === null || end !== null) return { start: day, end: null };
  if (day > start) return { start, end: day };
  return { start: day, end: null };
}

/** Plage à charger, null tant qu'aucun début n'est choisi. */
export function rangeFromSelection({ start, end }: DateRangeSelection): SpendingRange | null {
  if (start === null) return null;
  return { from: start, to: end ?? start };
}

export type DayStatus = 'start' | 'end' | 'single' | 'inside' | 'outside';

export function dayStatus({ selection, day }: { selection: DateRangeSelection; day: string }): DayStatus {
  const { start, end } = selection;
  if (start === null) return 'outside';
  if (end === null) return day === start ? 'single' : 'outside';
  if (day === start) return 'start';
  if (day === end) return 'end';
  return day > start && day < end ? 'inside' : 'outside';
}

/** Mois au format YYYY-MM. */
export function monthOf({ day }: { day: string }): string {
  return day.slice(0, 7);
}

export function addMonths({ month, months }: { month: string; months: number }): string {
  const [year, monthIndex] = month.split('-').map(Number) as [number, number];
  const total = year * 12 + (monthIndex - 1) + months;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return `${y}-${String(m).padStart(2, '0')}`;
}

/**
 * Semaines du mois (lundi → dimanche) ; null pour les cases hors du mois.
 */
export function monthGrid({ month }: { month: string }): Array<Array<string | null>> {
  const first = startOfMonth({ day: `${month}-01` });
  const weeks: Array<Array<string | null>> = [];
  let cursor = startOfWeek({ day: first });
  while (monthOf({ day: cursor }) <= month) {
    const week: Array<string | null> = [];
    for (let i = 0; i < 7; i++) {
      week.push(monthOf({ day: cursor }) === month ? cursor : null);
      cursor = addDays({ day: cursor, days: 1 });
    }
    weeks.push(week);
  }
  return weeks;
}
