import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type CreateOutflowUseCase = (input: {
  monthId: string;
  label: string;
  amount: number;
}) => Promise<MonthView>;

export function createCreateOutflow({ monthService }: { monthService: MonthService }): CreateOutflowUseCase {
  return ({ monthId, label, amount }) => monthService.createOutflow({ monthId, label, amount });
}
