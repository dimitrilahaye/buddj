import type { MonthView } from './month-view.js';

/** Retire un budget hebdo du mois (copie) — service in-memory après DELETE budgets. */
export function removeBudgetFromMonthView(month: MonthView, weeklyBudgetId: string): MonthView {
  const next = JSON.parse(JSON.stringify(month)) as MonthView;
  let removed = false;
  for (const g of next.budgetGroups) {
    const before = g.budgets.length;
    g.budgets = g.budgets.filter((b) => b.weeklyBudgetId !== weeklyBudgetId);
    if (g.budgets.length < before) removed = true;
  }
  if (!removed) throw new Error(`Budget introuvable : ${weeklyBudgetId}`);
  // Simule un solde prévisionnel recalculé (ex. après suppression d’une enveloppe vide)
  next.projectedBalance = Math.round((next.projectedBalance + 200) * 10) / 10;
  return next;
}
