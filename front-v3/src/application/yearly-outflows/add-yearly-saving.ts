import type { AddYearlySavingInput, YearlyOutflowsService } from './yearly-outflows-service.js';
import type { YearlyOutflowsView } from './yearly-outflows-view.js';

export type AddYearlySavingUseCase = (input: AddYearlySavingInput) => Promise<YearlyOutflowsView>;

export function createAddYearlySaving({
  yearlyOutflowsService,
}: {
  yearlyOutflowsService: YearlyOutflowsService;
}): AddYearlySavingUseCase {
  return (input) => yearlyOutflowsService.add(input);
}
