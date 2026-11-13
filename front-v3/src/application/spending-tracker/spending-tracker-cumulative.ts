import type { SpendingTrackerView } from './spending-tracker-types.js';

export type CumulativePoint = {
  /** Premier jour du bucket (YYYY-MM-DD) */
  start: string;
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
      start: bucket.start,
      bucketTotal: bucket.total,
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
