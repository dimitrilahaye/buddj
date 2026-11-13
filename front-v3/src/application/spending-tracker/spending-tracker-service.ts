import type { SpendingGranularity, SpendingTrackerView } from './spending-tracker-types.js';

export interface SpendingTrackerService {
  get(input: { granularity: SpendingGranularity; from: string; to: string }): Promise<SpendingTrackerView>;
}
