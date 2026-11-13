import type { SpendingGranularity } from '../application/spending-tracker/spending-tracker-types.js';

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const shortDayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortMonthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit', timeZone: 'UTC' });

function dateOf(start: string): Date {
  return new Date(`${start}T00:00:00Z`);
}

/** Libellé d'un bucket : « lun. 2 nov. », « semaine du 2 nov. », « novembre 2026 ». */
export function formatBucketLabel({
  start,
  granularity,
}: {
  start: string;
  granularity: SpendingGranularity;
}): string {
  if (granularity === 'week') return `semaine du ${shortDayFormatter.format(dateOf(start))}`;
  if (granularity === 'month') return monthFormatter.format(dateOf(start));
  return dayFormatter.format(dateOf(start));
}

/** Libellé compact pour un axe : « 2 nov. » ou « nov. 26 ». */
export function formatBucketAxisLabel({
  start,
  granularity,
}: {
  start: string;
  granularity: SpendingGranularity;
}): string {
  if (granularity === 'month') return shortMonthFormatter.format(dateOf(start));
  return shortDayFormatter.format(dateOf(start));
}

const shortDayWithYearFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Libellé d'une plage : « semaine du 9 nov. », « novembre 2026 » ou « du 1 nov. au 13 nov. ».
 */
export function formatRangeLabel({ from, to }: { from: string; to: string }): string {
  const fromDate = dateOf(from);
  const toDate = dateOf(to);
  const isMonday = fromDate.getUTCDay() === 1;
  const days = Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000);
  if (isMonday && days <= 6) return `semaine du ${shortDayFormatter.format(fromDate)}`;
  if (from.endsWith('-01') && from.slice(0, 7) === to.slice(0, 7)) return monthFormatter.format(fromDate);
  const formatter = from.slice(0, 4) === to.slice(0, 4) ? shortDayFormatter : shortDayWithYearFormatter;
  return `du ${formatter.format(fromDate)} au ${formatter.format(toDate)}`;
}
