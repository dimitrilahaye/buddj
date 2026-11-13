import SpendingTracker from "../../../core/models/spending-tracker/SpendingTracker.js";
import { TrackedSpendingKind } from "../../../core/models/spending-tracker/TrackedSpending.js";
import { SpendingTrackerGranularity } from "../../../core/commands/GetSpendingTrackerCommand.js";

export type TrackedSpendingDTO = {
  id: string;
  kind: TrackedSpendingKind;
  sourceId: string;
  label: string;
  amount: number;
  occurredAt: string;
};

export type SpendingBucketDTO = {
  start: string;
  total: number;
  expensesTotal: number;
  outflowsTotal: number;
  entries: TrackedSpendingDTO[];
};

export type SpendingTrackerDTO = {
  granularity: SpendingTrackerGranularity;
  from: string;
  to: string;
  total: number;
  expensesTotal: number;
  outflowsTotal: number;
  buckets: SpendingBucketDTO[];
};

export type SpendingTrackerDtoBuilder = (
  spendingTracker: SpendingTracker
) => SpendingTrackerDTO;

function spendingTrackerDto(
  spendingTracker: SpendingTracker
): SpendingTrackerDTO {
  return {
    granularity: spendingTracker.granularity,
    from: spendingTracker.from,
    to: spendingTracker.to,
    total: spendingTracker.total,
    expensesTotal: spendingTracker.expensesTotal,
    outflowsTotal: spendingTracker.outflowsTotal,
    buckets: spendingTracker.buckets.map((bucket) => ({
      start: bucket.start,
      total: bucket.total,
      expensesTotal: bucket.expensesTotal,
      outflowsTotal: bucket.outflowsTotal,
      entries: bucket.entries.map((entry) => ({
        id: entry.id,
        kind: entry.kind,
        sourceId: entry.sourceId,
        label: entry.label,
        amount: entry.amount,
        occurredAt: entry.occurredAt.toISOString(),
      })),
    })),
  };
}

export default spendingTrackerDto;
