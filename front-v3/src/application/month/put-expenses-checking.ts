import type { MonthService } from './month-service.js';
import type { ExpensesCheckingPayload } from './expenses-checking-payload.js';
import type { MonthView } from './month-view.js';

export type PutExpensesCheckingUseCase = (input: {
  monthId: string;
  body: ExpensesCheckingPayload;
}) => Promise<MonthView>;

export function createPutExpensesChecking({
  monthService,
}: {
  monthService: MonthService;
}): PutExpensesCheckingUseCase {
  return ({ monthId, body }) => monthService.putExpensesChecking(monthId, body);
}
