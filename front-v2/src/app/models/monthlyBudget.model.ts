/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type MonthlyBudget = {
  id: string;
  date: Date;
  dashboard: Dashboard;
  account: Account;
};

export type Dashboard = {
  account: DashboardAccount;
  weeks: DashboardWeeks;
};

export type DashboardAccount = {
  currentBalance: number;
  forecastBalance: number;
};

export type DashboardWeeks = {
  weeklyBudgets: DashboardWeeklyBudget[];
  forecastBalance: number;
};

export type DashboardWeeklyBudget = {
  weekName: string;
  initialBalance: number;
  currentBalance: number;
};

export type Account = {
  id: string;
  currentBalance: number;
  outflows: Outflow[];
  weeklyBudgets: WeeklyBudget[];
};

export type Outflow = {
  id: string;
  amount: number;
  label: string;
  isChecked: boolean;
};

export type WeeklyBudget = {
  id: string;
  name: string;
  expenses: Expense[];
};

export type Expense = {
  id: string;
  amount: number;
  label: string;
  isChecked: boolean;
};
