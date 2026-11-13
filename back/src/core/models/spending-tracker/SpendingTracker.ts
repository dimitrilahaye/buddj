import TrackedSpending from "./TrackedSpending.js";
import ParisCalendar from "./ParisCalendar.js";
import { SpendingTrackerGranularity } from "../../commands/GetSpendingTrackerCommand.js";

export type SpendingBucket = {
  /** Premier jour du bucket (YYYY-MM-DD) */
  start: string;
  total: number;
  expensesTotal: number;
  outflowsTotal: number;
  /** Triées par montant décroissant */
  entries: TrackedSpending[];
};

type Totals = Pick<SpendingBucket, "total" | "expensesTotal" | "outflowsTotal">;

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function totalsOf(entries: TrackedSpending[]): Totals {
  const sum = (kind?: TrackedSpending["kind"]) =>
    roundCents(
      entries
        .filter((entry) => kind === undefined || entry.kind === kind)
        .reduce((acc, entry) => acc + Number(entry.amount), 0)
    );
  return {
    total: sum(),
    expensesTotal: sum("expense"),
    outflowsTotal: sum("outflow"),
  };
}

function bucketStartOf(
  day: string,
  granularity: SpendingTrackerGranularity
): string {
  switch (granularity) {
    case "day":
      return day;
    case "week":
      return ParisCalendar.startOfWeek(day);
    case "month":
      return ParisCalendar.startOfMonth(day);
  }
}

function nextBucketStart(
  start: string,
  granularity: SpendingTrackerGranularity
): string {
  switch (granularity) {
    case "day":
      return ParisCalendar.addDays(start, 1);
    case "week":
      return ParisCalendar.addDays(start, 7);
    case "month":
      return ParisCalendar.addMonths(start, 1);
  }
}

export default class SpendingTracker {
  readonly granularity: SpendingTrackerGranularity;
  readonly from: string;
  readonly to: string;
  readonly total: number;
  readonly expensesTotal: number;
  readonly outflowsTotal: number;
  readonly buckets: SpendingBucket[];

  constructor(props: {
    granularity: SpendingTrackerGranularity;
    from: string;
    to: string;
    entries: TrackedSpending[];
  }) {
    this.granularity = props.granularity;
    this.from = props.from;
    this.to = props.to;

    const entriesByBucket = new Map<string, TrackedSpending[]>();
    const lastBucket = bucketStartOf(props.to, props.granularity);
    for (
      let start = bucketStartOf(props.from, props.granularity);
      start <= lastBucket;
      start = nextBucketStart(start, props.granularity)
    ) {
      entriesByBucket.set(start, []);
    }

    const entriesInRange = props.entries.filter((entry) => {
      const day = ParisCalendar.parisDayOf(entry.occurredAt);
      return day >= props.from && day <= props.to;
    });
    for (const entry of entriesInRange) {
      const day = ParisCalendar.parisDayOf(entry.occurredAt);
      entriesByBucket.get(bucketStartOf(day, props.granularity))?.push(entry);
    }

    this.buckets = [...entriesByBucket.entries()].map(([start, entries]) => {
      const sorted = [...entries].sort(
        (a, b) =>
          Number(b.amount) - Number(a.amount) ||
          a.occurredAt.getTime() - b.occurredAt.getTime()
      );
      return { start, ...totalsOf(sorted), entries: sorted };
    });

    const totals = totalsOf(entriesInRange);
    this.total = totals.total;
    this.expensesTotal = totals.expensesTotal;
    this.outflowsTotal = totals.outflowsTotal;
  }
}
