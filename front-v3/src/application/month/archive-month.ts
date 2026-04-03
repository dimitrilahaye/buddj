import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type ArchiveMonthUseCase = (input: { monthId: string }) => Promise<MonthView>;

export function createArchiveMonth({ monthService }: { monthService: MonthService }): ArchiveMonthUseCase {
  return ({ monthId }) => monthService.archiveMonth({ monthId });
}
