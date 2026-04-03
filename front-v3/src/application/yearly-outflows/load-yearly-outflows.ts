import type { YearlyOutflowsService } from './yearly-outflows-service.js';
import type { YearlyOutflowsView } from './yearly-outflows-view.js';

export type LoadYearlyOutflowsUseCase = () => Promise<YearlyOutflowsView>;

export function createLoadYearlyOutflows({
  yearlyOutflowsService,
}: {
  yearlyOutflowsService: YearlyOutflowsService;
}): LoadYearlyOutflowsUseCase {
  return () => yearlyOutflowsService.getAll();
}
