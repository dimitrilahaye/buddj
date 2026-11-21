import type { SpendingGranularity, SpendingRange } from '../spending-tracker/spending-tracker-types.js';

export type SavingsOperationType = 'deposit' | 'withdrawal';

export type SavingsOperation = {
  id: string;
  type: SavingsOperationType;
  /** Toujours positif ; le signe vient du type */
  amount: number;
  label: string | null;
  /** Jour de l'opération (YYYY-MM-DD) */
  date: string;
};

export type SavingsAccountView = {
  id: string;
  name: string;
  /** Solde, recalculé côté back à partir des opérations */
  amount: number;
  /** Triées de la plus récente à la plus ancienne */
  operations: SavingsOperation[];
};

export type SavingsOperationInput = {
  type: SavingsOperationType;
  amount: number;
  label: string | null;
  date: string;
};

export type SavingsTrackerBucket = {
  start: string;
  depositsTotal: number;
  withdrawalsTotal: number;
  /** Solde en fin de bucket */
  balance: number;
  cumulativeDeposits: number;
  cumulativeWithdrawals: number;
};

export type SavingsTrackerView = {
  savingsAccountId: string;
  granularity: SpendingGranularity;
  from: string;
  to: string;
  openingBalance: number;
  closingBalance: number;
  depositsTotal: number;
  withdrawalsTotal: number;
  net: number;
  buckets: SavingsTrackerBucket[];
};

export type SavingsTrackerRequest = SpendingRange & { savingsAccountId: string };
