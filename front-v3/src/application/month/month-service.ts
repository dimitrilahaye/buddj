import type { ExpensesCheckingPayload } from './expenses-checking-payload.js';
import type { MonthView } from './month-view.js';

export interface MonthService {
  getUnarchivedMonths(): Promise<MonthView[]>;
  putExpensesChecking(monthId: string, body: ExpensesCheckingPayload): Promise<MonthView>;
  deleteExpense(input: {
    monthId: string;
    weeklyBudgetId: string;
    expenseId: string;
  }): Promise<MonthView>;
  deleteBudget(input: { monthId: string; budgetId: string }): Promise<MonthView>;
  createExpense(input: {
    monthId: string;
    weeklyBudgetId: string;
    label: string;
    amount: number;
  }): Promise<MonthView>;
}
