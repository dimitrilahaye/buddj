import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type LoadUnarchivedMonthsUseCase = () => Promise<MonthView[]>;

/**
 * Use case : récupère les mois non archivés via MonthService (aucune connaissance du store).
 */
export function createLoadUnarchivedMonths({
  monthService,
}: {
  monthService: MonthService;
}): LoadUnarchivedMonthsUseCase {
  return () => monthService.getUnarchivedMonths();
}
