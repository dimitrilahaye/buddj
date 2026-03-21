import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type DeleteBudgetUseCase = (input: { monthId: string; budgetId: string }) => Promise<MonthView>;

export function createDeleteBudget({ monthService }: { monthService: MonthService }): DeleteBudgetUseCase {
  return ({ monthId, budgetId }) => monthService.deleteBudget({ monthId, budgetId });
}
