import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type UpdateOutflowUseCase = (input: {
  monthId: string;
  outflowId: string;
  /** Libellé API (ex. « 🔥 Kebab »). */
  label: string;
  amount: number;
}) => Promise<MonthView>;

export function createUpdateOutflow({ monthService }: { monthService: MonthService }): UpdateOutflowUseCase {
  return ({ monthId, outflowId, label, amount }) => monthService.updateOutflow({ monthId, outflowId, label, amount });
}
