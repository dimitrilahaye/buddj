import type {
  ApiSpendingTrackerPayload,
  SpendingTrackerView,
} from '../application/spending-tracker/spending-tracker-types.js';

export function mapApiSpendingTrackerToView(payload: ApiSpendingTrackerPayload): SpendingTrackerView {
  return {
    granularity: payload.granularity,
    from: payload.from,
    to: payload.to,
    total: Number(payload.total),
    expensesTotal: Number(payload.expensesTotal),
    outflowsTotal: Number(payload.outflowsTotal),
    buckets: payload.buckets.map((bucket) => ({
      start: bucket.start,
      total: Number(bucket.total),
      expensesTotal: Number(bucket.expensesTotal),
      outflowsTotal: Number(bucket.outflowsTotal),
      entries: bucket.entries.map((entry) => ({
        id: entry.id,
        kind: entry.kind,
        label: entry.label,
        amount: Number(entry.amount),
        occurredAt: entry.occurredAt,
      })),
    })),
  };
}
