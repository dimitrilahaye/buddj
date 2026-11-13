import type {
  SpendingBucket,
  SpendingKindsFilter,
  SpendingTrackerView,
  TrackedSpendingKind,
} from './spending-tracker-types.js';

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function totalFor({
  expensesTotal,
  outflowsTotal,
  kinds,
}: {
  expensesTotal: number;
  outflowsTotal: number;
  kinds: SpendingKindsFilter;
}): number {
  return roundCents((kinds.expense ? expensesTotal : 0) + (kinds.outflow ? outflowsTotal : 0));
}

/**
 * Ne garde que les types cochés : entrées filtrées, totaux recalculés.
 * Les totaux par type restent ceux de l'API, le type décoché vaut 0.
 */
export function filterSpendingTrackerView({
  view,
  kinds,
}: {
  view: SpendingTrackerView;
  kinds: SpendingKindsFilter;
}): SpendingTrackerView {
  const keep = (kind: TrackedSpendingKind): boolean => kinds[kind];
  const buckets: SpendingBucket[] = view.buckets.map((bucket) => ({
    start: bucket.start,
    expensesTotal: kinds.expense ? bucket.expensesTotal : 0,
    outflowsTotal: kinds.outflow ? bucket.outflowsTotal : 0,
    total: totalFor({ expensesTotal: bucket.expensesTotal, outflowsTotal: bucket.outflowsTotal, kinds }),
    entries: bucket.entries.filter((entry) => keep(entry.kind)),
  }));
  return {
    granularity: view.granularity,
    from: view.from,
    to: view.to,
    expensesTotal: kinds.expense ? view.expensesTotal : 0,
    outflowsTotal: kinds.outflow ? view.outflowsTotal : 0,
    total: totalFor({ expensesTotal: view.expensesTotal, outflowsTotal: view.outflowsTotal, kinds }),
    buckets,
  };
}
