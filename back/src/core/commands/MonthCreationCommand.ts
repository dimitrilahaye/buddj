import WeeklyExpense from "../models/month/account/WeeklyExpense.js";

export type OutflowCreationCommand = {
  label: string;
  amount: number;
};
export type BudgetCreationCommand = {
  name: string;
  initialBalance: number;
  expenses?: WeeklyExpense[];
};
interface MonthCreationCommand {
  date: Date;
  initialBalance: number;
  outflows: OutflowCreationCommand[];
  weeklyBudgets: BudgetCreationCommand[];
}

export default MonthCreationCommand;
