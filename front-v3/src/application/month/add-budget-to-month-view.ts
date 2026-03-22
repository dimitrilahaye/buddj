import { splitLeadingEmoji } from '../../shared/emoji-label.js';
import type { Budget } from './month-types.js';
import type { MonthView } from './month-view.js';

/**
 * Ajoute un budget hebdo au groupe « courant » (showAdd) — service in-memory après POST.
 */
export function addBudgetToMonthView(
  month: MonthView,
  budget: { weeklyBudgetId: string; apiName: string; initialBalance: number },
): MonthView {
  const next = JSON.parse(JSON.stringify(month)) as MonthView;
  const { icon, text } = splitLeadingEmoji({ label: budget.apiName, defaultIcon: '💰' });
  const newBudget: Budget = {
    name: text,
    icon,
    allocated: budget.initialBalance,
    weeklyBudgetId: budget.weeklyBudgetId,
    expenses: [],
  };
  const group = next.budgetGroups.find((g) => g.showAdd);
  if (!group) throw new Error('Aucun groupe de budgets courant');
  group.budgets.push(newBudget);
  return next;
}
