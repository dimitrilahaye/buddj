import type { MonthView } from './month-view.js';

export interface MonthService {
  getUnarchivedMonths(): Promise<MonthView[]>;
}
