import type { MonthView } from './month-view.js';

export type MonthState = {
  months: MonthView[];
  currentIndex: number;
  isLoadingMonths: boolean;
  loadMonthsErrorMessage: string | null;
  /** Id mois issu de l’URL à appliquer dès que les mois sont chargés (alignement route ↔ store). */
  pendingRouteMonthId: string | null;
};

export const DEFAULT_MONTH_STATE: MonthState = {
  months: [],
  currentIndex: 0,
  isLoadingMonths: false,
  loadMonthsErrorMessage: null,
  pendingRouteMonthId: null,
};

export function getCurrentMonth({ state }: { state: MonthState }): MonthView | null {
  const { months, currentIndex } = state;
  if (months.length === 0 || currentIndex < 0 || currentIndex >= months.length) return null;
  return months[currentIndex] ?? null;
}
