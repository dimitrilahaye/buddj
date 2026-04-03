import type { YearlyOutflowsService } from './yearly-outflows-service.js';
import type { YearlyOutflowsView } from './yearly-outflows-view.js';

export type RemoveYearlySavingUseCase = (input: { id: string }) => Promise<YearlyOutflowsView>;

export function createRemoveYearlySaving({
  yearlyOutflowsService,
}: {
  yearlyOutflowsService: YearlyOutflowsService;
}): RemoveYearlySavingUseCase {
  return (input) => yearlyOutflowsService.remove(input);
}
