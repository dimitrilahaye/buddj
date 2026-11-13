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
