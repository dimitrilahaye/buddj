import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type UpdateBudgetUseCase = (input: {
  monthId: string;
  budgetId: string;
  /** Libellé API (ex. « 🔥 Semaine 123 »). */
  name: string;
}) => Promise<MonthView>;

export function createUpdateBudget({ monthService }: { monthService: MonthService }): UpdateBudgetUseCase {
  return ({ monthId, budgetId, name }) => monthService.updateBudget({ monthId, budgetId, name });
}
