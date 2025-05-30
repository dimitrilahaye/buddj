import { Expense } from './monthlyBudget.model';

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
  currentBalance?: number;
  expenses?: Expense[];
  pendingFrom?: Date | null;
};

export type Outflow = {
  id: string;
  amount: number;
  label: string;
  isChecked: boolean;
  pendingFrom?: Date | null;
};

export type MonthCreationTemplate = {
  template: MonthTemplate;
  pendingDebits: {
    outflows: Outflow[];
    budgets: Budget[];
  };
};
