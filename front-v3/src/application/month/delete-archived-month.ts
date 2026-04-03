import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type DeleteArchivedMonthUseCase = (input: { monthId: string }) => Promise<MonthView[]>;

export function createDeleteArchivedMonth({
  monthService,
}: {
  monthService: MonthService;
}): DeleteArchivedMonthUseCase {
  return ({ monthId }) => monthService.deleteArchivedMonth({ monthId });
}
