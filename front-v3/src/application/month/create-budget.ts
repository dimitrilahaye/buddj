import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type CreateBudgetUseCase = (input: {
  monthId: string;
  /** Libellé API (ex. « 🔥 Test »). */
  name: string;
  initialBalance: number;
}) => Promise<MonthView>;

export function createCreateBudget({ monthService }: { monthService: MonthService }): CreateBudgetUseCase {
  return ({ monthId, name, initialBalance }) => monthService.createBudget({ monthId, name, initialBalance });
}
