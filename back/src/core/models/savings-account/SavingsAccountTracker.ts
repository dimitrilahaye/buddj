import SavingsAccountOperation from "./SavingsAccountOperation.js";
import ParisCalendar from "../spending-tracker/ParisCalendar.js";
import { SpendingTrackerGranularity } from "../../commands/GetSpendingTrackerCommand.js";

export type SavingsAccountBucket = {
  /** Premier jour du bucket (YYYY-MM-DD) */
  start: string;
  depositsTotal: number;
  withdrawalsTotal: number;
  /** Solde en fin de bucket */
  balance: number;
  /** Ajouts cumulés depuis le début de la période, en fin de bucket */
  cumulativeDeposits: number;
  /** Retraits cumulés depuis le début de la période, en fin de bucket */
  cumulativeWithdrawals: number;
};

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
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

function sumOf(
  operations: SavingsAccountOperation[],
  type: SavingsAccountOperation["type"]
): number {
  return roundCents(
    operations
      .filter((operation) => operation.type === type)
      .reduce((acc, operation) => acc + Number(operation.amount), 0)
  );
}

export default class SavingsAccountTracker {
  readonly savingsAccountId: string;
  readonly granularity: SpendingTrackerGranularity;
  readonly from: string;
  readonly to: string;
  /** Solde la veille de `from` */
  readonly openingBalance: number;
  /** Solde en fin de journée `to` */
  readonly closingBalance: number;
  readonly depositsTotal: number;
  readonly withdrawalsTotal: number;
  /** Ajouts moins retraits sur la période */
  readonly net: number;
  readonly buckets: SavingsAccountBucket[];

  constructor(props: {
    savingsAccountId: string;
    granularity: SpendingTrackerGranularity;
    from: string;
    to: string;
    operations: SavingsAccountOperation[];
  }) {
    this.savingsAccountId = props.savingsAccountId;
    this.granularity = props.granularity;
    this.from = props.from;
    this.to = props.to;

    this.openingBalance = roundCents(
      props.operations
        .filter((operation) => operation.date < props.from)
        .reduce((acc, operation) => acc + operation.signedAmount, 0)
    );

    const operationsInRange = props.operations.filter(
      (operation) => operation.date >= props.from && operation.date <= props.to
    );

    const operationsByBucket = new Map<string, SavingsAccountOperation[]>();
    const lastBucket = bucketStartOf(props.to, props.granularity);
    for (
      let start = bucketStartOf(props.from, props.granularity);
      start <= lastBucket;
      start = nextBucketStart(start, props.granularity)
    ) {
      operationsByBucket.set(start, []);
    }
    for (const operation of operationsInRange) {
      operationsByBucket
        .get(bucketStartOf(operation.date, props.granularity))
        ?.push(operation);
    }

    let cumulativeDeposits = 0;
    let cumulativeWithdrawals = 0;
    this.buckets = [...operationsByBucket.entries()].map(
      ([start, operations]) => {
        const depositsTotal = sumOf(operations, "deposit");
        const withdrawalsTotal = sumOf(operations, "withdrawal");
        cumulativeDeposits = roundCents(cumulativeDeposits + depositsTotal);
        cumulativeWithdrawals = roundCents(
          cumulativeWithdrawals + withdrawalsTotal
        );
        return {
          start,
          depositsTotal,
          withdrawalsTotal,
          balance: roundCents(
            this.openingBalance + cumulativeDeposits - cumulativeWithdrawals
          ),
          cumulativeDeposits,
          cumulativeWithdrawals,
        };
      }
    );

    this.depositsTotal = sumOf(operationsInRange, "deposit");
    this.withdrawalsTotal = sumOf(operationsInRange, "withdrawal");
    this.net = roundCents(this.depositsTotal - this.withdrawalsTotal);
    this.closingBalance = roundCents(this.openingBalance + this.net);
  }
}
