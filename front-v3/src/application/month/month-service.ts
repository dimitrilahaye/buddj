import type { CreateMonthApiBody } from '../new-month/default-new-month-bundle.js';
import type { ExpensesCheckingPayload } from './expenses-checking-payload.js';
import type { OutflowsCheckingPayload } from './outflows-checking-payload.js';
import type { MonthView } from './month-view.js';

export interface MonthService {
  getUnarchivedMonths(): Promise<MonthView[]>;
  createMonth(input: { body: CreateMonthApiBody }): Promise<MonthView>;
  getArchivedMonths(): Promise<MonthView[]>;
  archiveMonth(input: { monthId: string }): Promise<MonthView>;
  unarchiveMonth(input: { monthId: string }): Promise<MonthView[]>;
  deleteArchivedMonth(input: { monthId: string }): Promise<MonthView[]>;
  putExpensesChecking(monthId: string, body: ExpensesCheckingPayload): Promise<MonthView>;
  putOutflowsChecking(input: { monthId: string; body: OutflowsCheckingPayload }): Promise<MonthView>;
  deleteExpense(input: {
    monthId: string;
    weeklyBudgetId: string;
    expenseId: string;
  }): Promise<MonthView>;
  deleteOutflow(input: {
    monthId: string;
    outflowId: string;
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
