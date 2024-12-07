/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type MonthTemplate = {
  month: Date;
  startingBalance: number;
  weeklyBudgets: WeeklyBudget[];
  outflows: Outflow[];
};

export type WeeklyBudget = {
  name: string;
  initialBalance: number;
};

export type Outflow = {
  amount: number;
  label: string;
  isChecked: boolean;
};

export type PendingDebit = {
  id: string;
  monthId: string;
  monthDate: Date;
  label: string;
  amount: number;
  type: 'outflow' | 'expense';
};

export type MonthCreationTemplate = {
  template: MonthTemplate;
  pendingDebits: PendingDebit[];
};
