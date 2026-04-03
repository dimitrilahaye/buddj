import type { CreateMonthApiBody } from '../new-month/default-new-month-bundle.js';
import type { MonthView } from './month-view.js';
import type { MonthService } from './month-service.js';

export type CreateMonthUseCase = (input: { body: CreateMonthApiBody }) => Promise<MonthView>;

export function createCreateMonth({ monthService }: { monthService: MonthService }): CreateMonthUseCase {
  return async function createMonth({ body }: { body: CreateMonthApiBody }): Promise<MonthView> {
    return monthService.createMonth({ body });
  };
}
