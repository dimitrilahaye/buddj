import { splitLeadingEmoji } from '../../shared/emoji-label.js';
import type { MonthView } from './month-view.js';

/**
 * Ajoute une dépense au budget hebdo (copie) — service in-memory après POST.
 */
export function addExpenseToMonthView(
  month: MonthView,
  weeklyBudgetId: string,
  expense: { id: string; apiLabel: string; amount: number },
): MonthView {
  const next = JSON.parse(JSON.stringify(month)) as MonthView;
  const { icon, text } = splitLeadingEmoji({ label: expense.apiLabel, defaultIcon: '💰' });
  for (const g of next.budgetGroups) {
    for (const b of g.budgets) {
      if (b.weeklyBudgetId !== weeklyBudgetId) continue;
      b.expenses.push({
        id: expense.id,
        icon,
        desc: text,
        amount: expense.amount,
        taken: false,
      });
      next.projectedBalance = Math.round((next.projectedBalance - expense.amount) * 100) / 100;
      return next;
    }
  }
  throw new Error(`Budget hebdo introuvable : ${weeklyBudgetId}`);
}
