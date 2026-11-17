import type { UpdateYearlySavingInput, YearlyOutflowsService } from './yearly-outflows-service.js';
import type { YearlyOutflowsView } from './yearly-outflows-view.js';

export type UpdateYearlySavingUseCase = (input: UpdateYearlySavingInput) => Promise<YearlyOutflowsView>;

export function createUpdateYearlySaving({
  yearlyOutflowsService,
}: {
  yearlyOutflowsService: YearlyOutflowsService;
}): UpdateYearlySavingUseCase {
  return (input) => yearlyOutflowsService.update(input);
}
