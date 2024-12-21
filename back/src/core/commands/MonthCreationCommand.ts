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
}

export default MonthCreationCommand;
