import type { MonthService } from './month-service.js';
import type { MonthView } from './month-view.js';

export type TransferFromAccountUseCase = (input: {
  monthId: string;
  fromAccountId: string;
  toWeeklyBudgetId: string;
  amount: number;
}) => Promise<MonthView>;

export function createTransferFromAccount({
  monthService,
}: {
  monthService: MonthService;
}): TransferFromAccountUseCase {
  return ({ monthId, fromAccountId, toWeeklyBudgetId, amount }) =>
    monthService.transferFromAccount({
      monthId,
      fromAccountId,
      toWeeklyBudgetId,
      amount,
    });
}
