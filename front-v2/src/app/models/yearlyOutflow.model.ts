/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type YearlyOutflow = {
  id: string;
  month: number;
  label: string;
  amount: number;
  type: 'outflow';
};

export type YearlyBudget = {
  id: string;
  month: number;
  name: string;
  initialBalance: number;
  type: 'budget';
};

export type MonthlySavings = {
  outflows: YearlyOutflow[];
  budgets: YearlyBudget[];
};

export type YearlyOutflows = Record<number, MonthlySavings>;
