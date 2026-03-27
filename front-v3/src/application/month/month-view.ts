import type { BudgetGroupData, ChargeGroupData } from './month-types.js';

/**
 * Mois prêt pour l’UI (après mapping API → domaine).
 */
export interface MonthView {
  id: string;
  accountId?: string;
  /** Date du mois (ISO, ex. début de mois). */
  isoDate: string;
  /** Libellé affiché dans la barre récap (ex. « mars 2026 »). */
  displayLabel: string;
  currentBalance: number;
  projectedBalance: number;
  budgetGroups: BudgetGroupData[];
  chargeGroups?: ChargeGroupData[];
}
