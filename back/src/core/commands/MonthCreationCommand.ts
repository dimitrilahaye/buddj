import WeeklyExpense from "../models/month/account/WeeklyExpense.js";

export type OutflowCreationCommand = {
  label: string;
  amount: number;
  pendingFrom?: Date | null;
};
export type BudgetCreationCommand = {
  name: string;
  initialBalance: number;
  pendingFrom?: Date | null;
  expenses?: WeeklyExpense[];
};
interface MonthCreationCommand {
  date: Date;
  initialBalance: number;
  outflows: OutflowCreationCommand[];
  weeklyBudgets: BudgetCreationCommand[];
}

export default MonthCreationCommand;
