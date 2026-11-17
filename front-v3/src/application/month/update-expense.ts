import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type UpdateExpenseUseCase = (input: {
  monthId: string;
  weeklyBudgetId: string;
  expenseId: string;
  /** Libellé API (ex. « 🔥 Kebab »). */
  label: string;
  amount: number;
}) => Promise<MonthView>;

export function createUpdateExpense({ monthService }: { monthService: MonthService }): UpdateExpenseUseCase {
  return ({ monthId, weeklyBudgetId, expenseId, label, amount }) => monthService.updateExpense({ monthId, weeklyBudgetId, expenseId, label, amount });
}
