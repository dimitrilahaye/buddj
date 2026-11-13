import type { SpendingTrackerService } from './spending-tracker-service.js';
import type { SpendingRange, SpendingTrackerView } from './spending-tracker-types.js';
import { granularityForRange } from './spending-tracker-range.js';

export type LoadSpendingTrackerUseCase = (range: SpendingRange) => Promise<SpendingTrackerView>;

/** La granularité est déduite de la longueur de la plage. */
export function createLoadSpendingTracker({
  spendingTrackerService,
}: {
  spendingTrackerService: SpendingTrackerService;
}): LoadSpendingTrackerUseCase {
  return ({ from, to }) =>
    spendingTrackerService.get({ granularity: granularityForRange({ from, to }), from, to });
}
