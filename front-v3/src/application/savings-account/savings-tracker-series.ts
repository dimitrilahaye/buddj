/**
 * Courbes du suivi des épargnes : solde, ajouts cumulés et retraits cumulés, un point par bucket.
 */
import type { SavingsTrackerView } from './savings-account-types.js';

export type SavingsSeriesKey = 'balance' | 'deposits' | 'withdrawals';

export type SavingsChartSeries = {
  key: SavingsSeriesKey;
  label: string;
  /** Valeur CSS de couleur */
  color: string;
};

export type SavingsChartPoint = {
  /** Premier jour du bucket (YYYY-MM-DD) */
  key: string;
  values: Record<SavingsSeriesKey, number>;
};

export const SAVINGS_SERIES: SavingsChartSeries[] = [
  { key: 'balance', label: 'Solde', color: 'var(--series-savings-balance)' },
  { key: 'deposits', label: 'Ajouts cumulés', color: 'var(--series-savings-deposit)' },
  { key: 'withdrawals', label: 'Retraits cumulés', color: 'var(--series-savings-withdrawal)' },
];

export function savingsChartPoints({ view }: { view: SavingsTrackerView }): SavingsChartPoint[] {
  return view.buckets.map((bucket) => ({
    key: bucket.start,
    values: {
      balance: bucket.balance,
      deposits: bucket.cumulativeDeposits,
      withdrawals: bucket.cumulativeWithdrawals,
    },
  }));
}

/** Domaine vertical : inclut toujours 0 ; le solde peut baisser, donc on ne part pas du max seul. */
export function savingsValueDomain({ points }: { points: SavingsChartPoint[] }): { min: number; max: number } {
  const values = points.flatMap((p) => Object.values(p.values));
  return { min: Math.min(0, ...values), max: Math.max(0, ...values) };
}
