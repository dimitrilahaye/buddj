import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type UnarchiveMonthUseCase = (input: { monthId: string }) => Promise<MonthView[]>;

export function createUnarchiveMonth({ monthService }: { monthService: MonthService }): UnarchiveMonthUseCase {
  return ({ monthId }) => monthService.unarchiveMonth({ monthId });
}
