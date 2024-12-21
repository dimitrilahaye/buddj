import WeeklyBudget from "../month/account/WeeklyBudget.js";
import WeeklyExpense from "../month/account/WeeklyExpense.js";

export default class PendingBudget {
  readonly id: string;
  readonly name: string;
  readonly initialBalance: number;
  readonly expenses: WeeklyExpense[] = [];

  constructor(budget: WeeklyBudget, monthDate: Date) {
    this.id = budget.id;
    this.initialBalance = budget.currentBalance;
    const pendingExpenses = budget.expenses.filter(
      (expense) => expense.isChecked === false
    );
    if (pendingExpenses.length > 0) {
      this.expenses = pendingExpenses;
    }
    const date = monthDate;
    const options = { year: "numeric", month: "short" };
    const formattedDate = date.toLocaleDateString(
      "fr-FR",
      options as Intl.DateTimeFormatOptions
    );
    this.name = `${budget.name} (${formattedDate})`;
  }
}
