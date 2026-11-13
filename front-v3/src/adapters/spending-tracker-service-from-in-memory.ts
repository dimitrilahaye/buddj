import type { SpendingTrackerService } from '../application/spending-tracker/spending-tracker-service.js';
import {
  addDays,
  startOfMonth,
  startOfWeek,
} from '../application/spending-tracker/spending-tracker-range.js';
import type {
  SpendingBucket,
  SpendingGranularity,
  SpendingTrackerView,
  TrackedSpendingEntry,
} from '../application/spending-tracker/spending-tracker-types.js';

/** Entrée de test : `day` est le jour calendaire où la dépense compte. */
export type InMemoryTrackedSpending = TrackedSpendingEntry & { day: string };

export type InMemorySpendingTrackerCall = { granularity: SpendingGranularity; from: string; to: string };

function bucketStart({ day, granularity }: { day: string; granularity: SpendingGranularity }): string {
  if (granularity === 'week') return startOfWeek({ day });
  if (granularity === 'month') return startOfMonth({ day });
  return day;
}

function nextBucket({ start, granularity }: { start: string; granularity: SpendingGranularity }): string {
  if (granularity === 'week') return addDays({ day: start, days: 7 });
  if (granularity === 'month') {
    const date = new Date(`${start}T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + 1);
    return date.toISOString().slice(0, 10);
  }
  return addDays({ day: start, days: 1 });
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function totals(entries: TrackedSpendingEntry[]) {
  const sum = (kind?: TrackedSpendingEntry['kind']) =>
    round(entries.filter((e) => !kind || e.kind === kind).reduce((acc, e) => acc + e.amount, 0));
  return { total: sum(), expensesTotal: sum('expense'), outflowsTotal: sum('outflow') };
}

/**
 * Service en mémoire pour les tests : reproduit le regroupement du back
 * et garde la trace des appels (`calls`).
 */
export function createSpendingTrackerServiceFromInMemory({
  spendings = [],
  delayMs = 0,
  failWith,
}: {
  spendings?: InMemoryTrackedSpending[];
  delayMs?: number;
  failWith?: string;
} = {}): SpendingTrackerService & { calls: InMemorySpendingTrackerCall[] } {
  const calls: InMemorySpendingTrackerCall[] = [];
  return {
    calls,
    async get({ granularity, from, to }) {
      calls.push({ granularity, from, to });
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      if (failWith) throw new Error(failWith);

      const inRange = spendings.filter((s) => s.day >= from && s.day <= to);
      const buckets: SpendingBucket[] = [];
      const last = bucketStart({ day: to, granularity });
      for (let start = bucketStart({ day: from, granularity }); start <= last; start = nextBucket({ start, granularity })) {
        const end = nextBucket({ start, granularity });
        const entries = inRange
          .filter((s) => s.day >= start && s.day < end)
          .map((s) => ({ id: s.id, kind: s.kind, label: s.label, amount: s.amount, occurredAt: s.occurredAt }))
          .sort((a, b) => b.amount - a.amount);
        buckets.push({ start, ...totals(entries), entries });
      }
      const view: SpendingTrackerView = {
        granularity,
        from,
        to,
        ...totals(inRange),
        buckets,
      };
      return view;
    },
  };
}
