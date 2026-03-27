import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type TransferFromWeeklyBudgetUseCase = (input: {
  monthId: string;
  fromWeeklyBudgetId: string;
  destinationType: 'weekly-budget' | 'account';
  destinationId: string;
  amount: number;
}) => Promise<MonthView>;

export function createTransferFromWeeklyBudget({
  monthService,
}: {
  monthService: MonthService;
}): TransferFromWeeklyBudgetUseCase {
  return ({ monthId, fromWeeklyBudgetId, destinationType, destinationId, amount }) =>
    monthService.transferFromWeeklyBudget({
      monthId,
      fromWeeklyBudgetId,
      destinationType,
      destinationId,
      amount,
    });
}
