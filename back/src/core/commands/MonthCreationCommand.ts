import { PendingDebitProps } from "../models/pending-debit/PendingDebit.js";

export type OutflowCreationCommand = {
  label: string;
  amount: number;
};
export type WeeklyBudgetCreationCommand = {
  name: string;
  initialBalance: number;
};
interface MonthCreationCommand {
  date: Date;
  initialBalance: number;
  outflows: OutflowCreationCommand[];
  weeklyBudgets: WeeklyBudgetCreationCommand[];
  pendingDebits: PendingDebitProps[];
}

export default MonthCreationCommand;
