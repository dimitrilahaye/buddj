import WeeklyBudget from "../month/account/WeeklyBudget.js";
import WeeklyExpense from "../month/account/WeeklyExpense.js";

export default class PendingBudget {
  readonly id: string;
  readonly name: string;
  readonly initialBalance: number;
  readonly currentBalance: number;
  readonly pendingFrom: Date;
  readonly expenses: WeeklyExpense[] = [];

  constructor(budget: WeeklyBudget, monthDate: Date) {
    this.id = budget.id;
    const pendingExpenses = budget.expenses.filter(
      (expense) => expense.isChecked === false
    );
    if (pendingExpenses.length > 0) {
      this.expenses = pendingExpenses;
      const totalExpenses = this.expenses.reduce(
        (total, expense) => total + expense.amount,
        0
      );
      this.initialBalance = Number(
        (budget.currentBalance + totalExpenses).toFixed(2)
      );
      this.currentBalance = Number(
        (this.initialBalance - totalExpenses).toFixed(2)
      );
    } else {
      this.initialBalance = Number(budget.currentBalance.toFixed(2));
      this.currentBalance = Number(this.initialBalance.toFixed(2));
    }
    this.pendingFrom = monthDate;
    this.name = budget.name;
  }
}
