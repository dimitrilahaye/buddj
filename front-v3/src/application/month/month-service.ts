import type { ExpensesCheckingPayload } from './expenses-checking-payload.js';
import type { MonthView } from './month-view.js';

export interface MonthService {
  getUnarchivedMonths(): Promise<MonthView[]>;
  putExpensesChecking(monthId: string, body: ExpensesCheckingPayload): Promise<MonthView>;
}
