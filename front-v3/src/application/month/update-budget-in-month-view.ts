import { splitLeadingEmoji } from '../../shared/emoji-label.js';
import type { MonthView } from './month-view.js';

/**
 * Met à jour le libellé / icône d’un budget hebdo à partir du `name` API (ex. « 🔥 Vacances »).
 */
export function updateBudgetInMonthView(month: MonthView, budgetId: string, apiName: string): MonthView {
  const next = JSON.parse(JSON.stringify(month)) as MonthView;
  const { icon, text } = splitLeadingEmoji({ label: apiName, defaultIcon: '💰' });
  for (const g of next.budgetGroups) {
    for (const b of g.budgets) {
      if (b.weeklyBudgetId === budgetId) {
        b.name = text;
        b.icon = icon;
        return next;
      }
    }
  }
  throw new Error(`Budget introuvable : ${budgetId}`);
}
