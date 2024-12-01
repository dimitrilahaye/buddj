/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type MonthTemplate = {
  id: string;
  name: string;
  isDefault: boolean;
  month: Date;
  startingBalance: number;
  budgets: Budget[];
  outflows: Outflow[];
};

export type Budget = {
  id: string;
  name: string;
  initialBalance: number;
};

export type Outflow = {
  id: string;
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
