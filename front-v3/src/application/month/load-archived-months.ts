import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type LoadArchivedMonthsUseCase = () => Promise<MonthView[]>;

export function createLoadArchivedMonths({
  monthService,
}: {
  monthService: MonthService;
}): LoadArchivedMonthsUseCase {
  return () => monthService.getArchivedMonths();
}
