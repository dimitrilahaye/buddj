/**
 * Courbe du suivi des épargnes : le solde en fin de bucket, qui monte avec les ajouts et
 * descend avec les retraits ; chaque point garde aussi les mouvements du bucket.
 */
import type { SavingsTrackerView } from './savings-account-types.js';

export type SavingsChartPoint = {
  /** Premier jour du bucket (YYYY-MM-DD) */
  key: string;
  /** Solde en fin de bucket */
  balance: number;
  /** Ajouts du bucket */
  deposits: number;
  /** Retraits du bucket */
  withdrawals: number;
};

export function savingsChartPoints({ view }: { view: SavingsTrackerView }): SavingsChartPoint[] {
  return view.buckets.map((bucket) => ({
    key: bucket.start,
    balance: bucket.balance,
    deposits: bucket.depositsTotal,
    withdrawals: bucket.withdrawalsTotal,
  }));
}

/**
 * Domaine vertical calé sur le solde, sans forcer 0 : sinon un solde de 4 850 € qui bouge
 * de quelques centaines d'euros dessinerait une ligne plate. Solde constant : petite marge.
 */
export function savingsValueDomain({ points }: { points: SavingsChartPoint[] }): { min: number; max: number } {
  if (points.length === 0) return { min: 0, max: 0 };
  const balances = points.map((p) => p.balance);
  const min = Math.min(...balances);
  const max = Math.max(...balances);
  if (min !== max) return { min, max };
  const margin = Math.max(10, Math.abs(min) * 0.05);
  return { min: min - margin, max: max + margin };
}
