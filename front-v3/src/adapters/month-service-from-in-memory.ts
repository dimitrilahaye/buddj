import type { MonthService } from '../application/month/month-service.js';
import type { MonthView } from '../application/month/month-view.js';

export function createMonthServiceFromInMemory({
  months,
  delayMs = 0,
}: {
  months: MonthView[];
  delayMs?: number;
}): MonthService {
  return {
    async getUnarchivedMonths() {
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      return months.map((m) => ({
        ...m,
        budgetGroups: m.budgetGroups.map((g) => ({
          ...g,
          budgets: g.budgets.map((b) => ({
            ...b,
            expenses: b.expenses.map((e) => ({ ...e })),
          })),
        })),
      }));
    },
  };
}
