import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type DeleteExpenseUseCase = (input: {
  monthId: string;
  weeklyBudgetId: string;
  expenseId: string;
}) => Promise<MonthView>;

export function createDeleteExpense({ monthService }: { monthService: MonthService }): DeleteExpenseUseCase {
  return ({ monthId, weeklyBudgetId, expenseId }) =>
    monthService.deleteExpense({ monthId, weeklyBudgetId, expenseId });
}
