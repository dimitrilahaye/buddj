import type { SpendingBucket, SpendingGranularity, SpendingTrackerView } from './spending-tracker-types.js';
import { todayIso } from './spending-tracker-range.js';

/** Pas de la courbe : les buckets de l'API, ou l'heure pour une plage d'un seul jour. */
export type CumulativeStep = SpendingGranularity | 'hour';

export type CumulativePoint = {
  /** Premier jour du bucket (YYYY-MM-DD), ou l'heure (« 0 » à « 23 ») en pas horaire */
  key: string;
  /** Montant dépensé dans ce bucket seul */
  bucketTotal: number;
  /** Cumuls depuis le début de la période, fin de bucket incluse */
  expenses: number;
  outflows: number;
  total: number;
};

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Cumul des dépenses et sorties bucket après bucket : la courbe qui monte. */
export function cumulativeSpending({ view }: { view: SpendingTrackerView }): CumulativePoint[] {
  let expenses = 0;
  let outflows = 0;
  return view.buckets.map((bucket) => {
    expenses = roundCents(expenses + bucket.expensesTotal);
    outflows = roundCents(outflows + bucket.outflowsTotal);
    return {
      key: bucket.start,
      bucketTotal: bucket.total,
      expenses,
      outflows,
      total: roundCents(expenses + outflows),
    };
  });
}

/**
 * Cumul heure par heure d'une journée, à partir de l'horodatage des entrées (heure locale).
 * La journée en cours s'arrête à l'heure actuelle, une journée passée va jusqu'à 23 h.
 */
export function hourlyCumulativeSpending({
  bucket,
  now = new Date(),
}: {
  bucket: SpendingBucket;
  now?: Date;
}): CumulativePoint[] {
  const lastHour = bucket.start === todayIso({ now }) ? now.getHours() : 23;
  const perHour = Array.from({ length: lastHour + 1 }, () => ({ expenses: 0, outflows: 0 }));
  for (const entry of bucket.entries) {
    const hour = Math.min(new Date(entry.occurredAt).getHours(), lastHour);
    if (entry.kind === 'expense') perHour[hour]!.expenses += entry.amount;
    else perHour[hour]!.outflows += entry.amount;
  }
  let expenses = 0;
  let outflows = 0;
  return perHour.map((hour, index) => {
    expenses = roundCents(expenses + hour.expenses);
    outflows = roundCents(outflows + hour.outflows);
    return {
      key: String(index),
      bucketTotal: roundCents(hour.expenses + hour.outflows),
      expenses,
      outflows,
      total: roundCents(expenses + outflows),
    };
  });
}

/** Graduation « ronde » de l'axe des montants : 0, pas, 2 × pas… jusqu'à couvrir max. */
export function niceAxisTicks({ max, count = 4 }: { max: number; count?: number }): number[] {
  if (max <= 0) return [0];
  const rawStep = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const ticks: number[] = [];
  for (let value = 0; value < max + step; value += step) {
    ticks.push(roundCents(value));
    if (value >= max) break;
  }
  return ticks;
}
