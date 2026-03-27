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
  createBudget(input: {
    monthId: string;
    name: string;
    initialBalance: number;
  }): Promise<MonthView>;
  createOutflow(input: {
    monthId: string;
    label: string;
    amount: number;
  }): Promise<MonthView>;
  updateBudget(input: { monthId: string; budgetId: string; name: string }): Promise<MonthView>;
  transferFromWeeklyBudget(input: {
    monthId: string;
    fromWeeklyBudgetId: string;
    destinationType: 'weekly-budget' | 'account';
    destinationId: string;
    amount: number;
  }): Promise<MonthView>;
  transferFromAccount(input: {
    monthId: string;
    fromAccountId: string;
    toWeeklyBudgetId: string;
    amount: number;
  }): Promise<MonthView>;
}
