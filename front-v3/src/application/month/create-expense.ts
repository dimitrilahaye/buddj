import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type CreateExpenseUseCase = (input: {
  monthId: string;
  weeklyBudgetId: string;
  label: string;
  amount: number;
}) => Promise<MonthView>;

export function createCreateExpense({ monthService }: { monthService: MonthService }): CreateExpenseUseCase {
  return ({ monthId, weeklyBudgetId, label, amount }) =>
    monthService.createExpense({ monthId, weeklyBudgetId, label, amount });
}
