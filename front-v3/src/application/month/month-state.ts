import type { MonthView } from './month-view.js';

export type MonthState = {
  /**
   * `null` tant que la liste des mois non archivés n’a pas encore été chargée une première fois (succès ou échec).
   * Après le premier chargement : toujours un tableau (éventuellement vide).
   */
  months: MonthView[] | null;
  currentIndex: number;
  isLoadingMonths: boolean;
  loadMonthsErrorMessage: string | null;
  /** Id mois issu de l’URL à appliquer dès que les mois sont chargés (alignement route ↔ store). */
  pendingRouteMonthId: string | null;
};

export const DEFAULT_MONTH_STATE: MonthState = {
  months: null,
  currentIndex: 0,
  isLoadingMonths: false,
  loadMonthsErrorMessage: null,
  pendingRouteMonthId: null,
};

export function getCurrentMonth({ state }: { state: MonthState }): MonthView | null {
  const { months, currentIndex } = state;
  if (months === null || months.length === 0 || currentIndex < 0 || currentIndex >= months.length) {
    return null;
  }
  return months[currentIndex] ?? null;
}
