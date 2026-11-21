import type { SavingsAccountService } from '../application/savings-account/savings-account-service.js';
import type {
  SavingsAccountView,
  SavingsOperation,
  SavingsTrackerBucket,
  SavingsTrackerView,
} from '../application/savings-account/savings-account-types.js';
import { addDays, startOfMonth, startOfWeek } from '../application/spending-tracker/spending-tracker-range.js';
import type { SpendingGranularity } from '../application/spending-tracker/spending-tracker-types.js';

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

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

function signed(operation: SavingsOperation): number {
  return operation.type === 'deposit' ? operation.amount : -operation.amount;
}

function sumOf(operations: SavingsOperation[], type: SavingsOperation['type']): number {
  return round(operations.filter((o) => o.type === type).reduce((acc, o) => acc + o.amount, 0));
}

/** Reproduit le back : solde recalculé, opérations de la plus récente à la plus ancienne. */
function withRecomputedAmount(account: SavingsAccountView): SavingsAccountView {
  const operations = [...account.operations].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { ...account, operations, amount: round(operations.reduce((acc, o) => acc + signed(o), 0)) };
}

/**
 * Service en mémoire pour les tests : reproduit le calcul du back et garde la trace des appels.
 */
export function createSavingsAccountServiceFromInMemory({
  accounts = [],
  failWith,
}: {
  accounts?: Array<Omit<SavingsAccountView, 'amount'>>;
  /** Fait échouer toutes les écritures */
  failWith?: string;
} = {}): SavingsAccountService & { trackerCalls: Array<{ savingsAccountId: string; from: string; to: string }> } {
  let store = accounts.map((a) => withRecomputedAmount({ ...a, amount: 0 }));
  let nextId = 1;
  const trackerCalls: Array<{ savingsAccountId: string; from: string; to: string }> = [];

  function find(savingsAccountId: string): SavingsAccountView {
    const account = store.find((a) => a.id === savingsAccountId);
    if (!account) throw new Error("Le compte épargne n'existe pas");
    return account;
  }

  function replace(account: SavingsAccountView): SavingsAccountView {
    const updated = withRecomputedAmount(account);
    store = store.map((a) => (a.id === updated.id ? updated : a));
    return updated;
  }

  return {
    trackerCalls,
    async getAll() {
      return store;
    },
    async addOperation({ savingsAccountId, operation }) {
      if (failWith) throw new Error(failWith);
      const account = find(savingsAccountId);
      return replace({ ...account, operations: [{ id: `op-${nextId++}`, ...operation }, ...account.operations] });
    },
    async updateOperation({ savingsAccountId, operationId, operation }) {
      if (failWith) throw new Error(failWith);
      const account = find(savingsAccountId);
      return replace({
        ...account,
        operations: account.operations.map((o) => (o.id === operationId ? { id: operationId, ...operation } : o)),
      });
    },
    async deleteOperation({ savingsAccountId, operationId }) {
      if (failWith) throw new Error(failWith);
      const account = find(savingsAccountId);
      return replace({ ...account, operations: account.operations.filter((o) => o.id !== operationId) });
    },
    async getTracker({ savingsAccountId, granularity, from, to }) {
      trackerCalls.push({ savingsAccountId, from, to });
      const { operations } = find(savingsAccountId);
      const openingBalance = round(operations.filter((o) => o.date < from).reduce((acc, o) => acc + signed(o), 0));
      const inRange = operations.filter((o) => o.date >= from && o.date <= to);
      const buckets: SavingsTrackerBucket[] = [];
      let cumulativeDeposits = 0;
      let cumulativeWithdrawals = 0;
      const last = bucketStart({ day: to, granularity });
      for (let start = bucketStart({ day: from, granularity }); start <= last; start = nextBucket({ start, granularity })) {
        const end = nextBucket({ start, granularity });
        const ops = inRange.filter((o) => o.date >= start && o.date < end);
        const depositsTotal = sumOf(ops, 'deposit');
        const withdrawalsTotal = sumOf(ops, 'withdrawal');
        cumulativeDeposits = round(cumulativeDeposits + depositsTotal);
        cumulativeWithdrawals = round(cumulativeWithdrawals + withdrawalsTotal);
        buckets.push({
          start,
          depositsTotal,
          withdrawalsTotal,
          balance: round(openingBalance + cumulativeDeposits - cumulativeWithdrawals),
          cumulativeDeposits,
          cumulativeWithdrawals,
        });
      }
      const depositsTotal = sumOf(inRange, 'deposit');
      const withdrawalsTotal = sumOf(inRange, 'withdrawal');
      const net = round(depositsTotal - withdrawalsTotal);
      const view: SavingsTrackerView = {
        savingsAccountId,
        granularity,
        from,
        to,
        openingBalance,
        closingBalance: round(openingBalance + net),
        depositsTotal,
        withdrawalsTotal,
        net,
        buckets,
      };
      return view;
    },
  };
}
