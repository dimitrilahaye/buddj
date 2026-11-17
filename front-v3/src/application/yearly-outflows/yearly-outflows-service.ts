import type { YearlyOutflowsView } from './yearly-outflows-view.js';

export type AddYearlySavingInput = {
  kind: 'outflow' | 'budget';
  month: number;
  label: string;
  amount: number;
};

/** Même champs pour une charge et un budget annuels : l’API stocke `label`/`amount` dans les deux cas. */
export type UpdateYearlySavingInput = {
  id: string;
  label: string;
  amount: number;
};

export interface YearlyOutflowsService {
  getAll(): Promise<YearlyOutflowsView>;
  add(input: AddYearlySavingInput): Promise<YearlyOutflowsView>;
  remove(input: { id: string }): Promise<YearlyOutflowsView>;
  update(input: UpdateYearlySavingInput): Promise<YearlyOutflowsView>;
}
