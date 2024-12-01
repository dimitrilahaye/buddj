import { PendingDebitProps } from "../models/pending-debit/PendingDebit.js";

export type OutflowCreationCommand = {
  label: string;
  amount: number;
};
export type BudgetCreationCommand = {
  name: string;
  initialBalance: number;
};
interface MonthCreationCommand {
  date: Date;
  initialBalance: number;
  outflows: OutflowCreationCommand[];
  weeklyBudgets: BudgetCreationCommand[];
  pendingDebits: PendingDebitProps[];
}

export default MonthCreationCommand;
