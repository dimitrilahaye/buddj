import Month from "../../models/month/Month.js";
import WeeklyExpense from "../../models/month/account/WeeklyExpense.js";
import AccountOutflow from "../../models/month/account/AccountOutflow.js";
import TransferableMonth from "../../models/transferable-month/TransferableMonth.js";
import WeeklyBudget from "../../models/month/account/WeeklyBudget.js";

export default interface MonthRepository {
  save(month: Month): Promise<Month>;

  addExpenseToWeeklyBudget(
    month: Month,
    weeklyId: string,
    expense: WeeklyExpense
  ): Promise<void>;

  addOutflow(month: Month, outflow: AccountOutflow): Promise<void>;

  addBudget(month: Month, budget: WeeklyBudget): Promise<void>;

  updateBudget(budgetId: string, name: string): Promise<void>;

  updateAccountCurrentBalance(month: Month): Promise<void>;

  updateWeeklyBudgetCurrentBalance(
    month: Month,
    weeklyId: string
  ): Promise<void>;

  deleteExpense(expenseId: string): Promise<void>;

  deleteOutflow(outflowId: string): Promise<void>;

  manageOutflowsChecking(
    outflows: {
      id: string;
      isChecked: boolean;
    }[]
  ): Promise<void>;

  manageExpensesChecking(
    month: Month,
    weeklyBudgets: {
      id: string;
      expenses: { id: string; isChecked: boolean }[];
    }[]
  ): Promise<void>;

  archive(month: Month): Promise<void>;

  unarchive(month: Month): Promise<void>;

  delete(month: Month): Promise<void>;

  findAllUnarchived(): Promise<Month[]>;

  findAllArchived(): Promise<Month[]>;

  getById(monthId: string): Promise<Month | null>;

  getTransferableById(monthId: string): Promise<TransferableMonth | null>;

  updateWeeklyBudgetInitialBalance(
    month: Month,
    weeklyId: string
  ): Promise<void>;
}
