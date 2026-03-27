import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type DeleteOutflowUseCase = (input: {
  monthId: string;
  outflowId: string;
}) => Promise<MonthView>;

export function createDeleteOutflow({ monthService }: { monthService: MonthService }): DeleteOutflowUseCase {
  return ({ monthId, outflowId }) => monthService.deleteOutflow({ monthId, outflowId });
}
