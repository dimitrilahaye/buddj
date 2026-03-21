import type { MonthView } from './month-view.js';

/**
 * Retire une dépense du mois (copie) — pour le service in-memory après DELETE.
 * Ajuste légèrement le solde prévisionnel pour coller à un ordre de grandeur « serveur ».
 */
export function removeExpenseFromMonthView(
  month: MonthView,
  weeklyBudgetId: string,
  expenseId: string,
): MonthView {
  const next = JSON.parse(JSON.stringify(month)) as MonthView;
  for (const g of next.budgetGroups) {
    for (const b of g.budgets) {
      if (b.weeklyBudgetId !== weeklyBudgetId) continue;
      const before = b.expenses.length;
      b.expenses = b.expenses.filter((e) => e.id !== expenseId);
      if (b.expenses.length === before) throw new Error(`Dépense introuvable : ${expenseId}`);
      next.projectedBalance = Math.round((next.projectedBalance - 35.3) * 10) / 10;
      return next;
    }
  }
  throw new Error(`Budget hebdo introuvable : ${weeklyBudgetId}`);
}
