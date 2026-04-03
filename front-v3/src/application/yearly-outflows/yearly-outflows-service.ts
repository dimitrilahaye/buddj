import type { YearlyOutflowsView } from './yearly-outflows-view.js';

export type AddYearlySavingInput = {
  kind: 'outflow' | 'budget';
  month: number;
  label: string;
  amount: number;
};

export interface YearlyOutflowsService {
  getAll(): Promise<YearlyOutflowsView>;
  add(input: AddYearlySavingInput): Promise<YearlyOutflowsView>;
  remove(input: { id: string }): Promise<YearlyOutflowsView>;
}
