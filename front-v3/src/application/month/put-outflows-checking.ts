import type { MonthService } from './month-service.js';
import type { OutflowsCheckingPayload } from './outflows-checking-payload.js';
import type { MonthView } from './month-view.js';

export type PutOutflowsCheckingUseCase = (input: {
  monthId: string;
  body: OutflowsCheckingPayload;
}) => Promise<MonthView>;

export function createPutOutflowsChecking({
  monthService,
}: {
  monthService: MonthService;
}): PutOutflowsCheckingUseCase {
  return ({ monthId, body }) => monthService.putOutflowsChecking({ monthId, body });
}
