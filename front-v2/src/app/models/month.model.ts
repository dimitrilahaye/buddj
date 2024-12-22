/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type Month = {
  month: Date;
  startingBalance: number;
  weeklyBudgets: WeeklyBudget[];
  outflows: Outflow[];
};

export type WeeklyBudget = {
  name: string;
  initialBalance: number;
  pendingFrom?: Date | null;
};

export type Outflow = {
  amount: number;
  label: string;
  isChecked: boolean;
  pendingFrom?: Date | null;
};
