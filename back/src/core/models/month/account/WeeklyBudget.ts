import { AccountBudgetNameCantBeEmptyError } from "../../../errors/WeeklyBudgetErrors.js";
import WeeklyExpense from "./WeeklyExpense.js";
import { WeeklyExpenseNotFoundError } from "../../../errors/WeeklyExpenseErrors.js";

export default class WeeklyBudget {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  startAt: Date | null;
  endAt: Date | null;
  expenses: WeeklyExpense[];
  pendingFrom: Date | null = null;

  constructor(props: {
    id: string;
    name: string;
    initialBalance: number;
    expenses?: WeeklyExpense[];
    pendingFrom?: Date;
  }) {
    this.initialBalance = Number(props.initialBalance.toFixed(2));
    this.id = props.id;
    if (props.name.length === 0) {
      throw new AccountBudgetNameCantBeEmptyError();
    }
    this.name = props.name;
    this.startAt = null;
    this.endAt = null;
    this.expenses = props.expenses ?? [];
    if (props.pendingFrom) {
      this.pendingFrom = props.pendingFrom;
    }
    this.calculateCurrentBalance();
  }

  isPending() {
    return this.pendingFrom !== null;
  }

  addExpense(expense: WeeklyExpense) {
    this.expenses.push(expense);
    this.calculateCurrentBalance();
  }

  checkExpense(expenseId: string) {
    const expense = this.findExpenseById(expenseId);
    expense.check();
    this.calculateCurrentBalance();
  }

  uncheckExpense(expenseId: string) {
    const expense = this.findExpenseById(expenseId);
    expense.uncheck();
    this.calculateCurrentBalance();
  }

  deleteExpenseById(expenseId: string) {
    this.expenses = this.expenses.filter((expense) => expense.id !== expenseId);
    this.calculateCurrentBalance();
  }

  updateExpenseAmount(expenseId: string, amount: number) {
    const expense = this.findExpenseById(expenseId);
    expense.updateAmount(amount);
    this.calculateCurrentBalance();
  }

  updateExpenseLabel(expenseId: string, label: string) {
    const expense = this.findExpenseById(expenseId);
    expense.updateLabel(label);
  }

  updateName(name: string) {
    if (name.length === 0) {
      throw new AccountBudgetNameCantBeEmptyError();
    }
    this.name = name;
  }

  findExpenseById(expenseId: string) {
    const expense = this.expenses.find((expense) => expense.id === expenseId);
    if (!expense) {
      throw new WeeklyExpenseNotFoundError();
    }
    return expense;
  }

  get amountForOutflow() {
    const sumOfCheckedExpensesAmount = this.expenses
      .filter((expense) => expense.isChecked)
      .reduce((prev, curr) => prev + curr.amount, 0);

    let amountForOutflow = Number(
      (this.initialBalance - sumOfCheckedExpensesAmount).toFixed(2)
    );

    if (this.currentBalance <= 0) {
      amountForOutflow -= this.currentBalance;
    }

    return Number(amountForOutflow.toFixed(2));
  }

  calculateCurrentBalance() {
    const sumOfAllExpenses = this.expenses.reduce(
      (prev, curr) => prev + curr.amount,
      0
    );
    this.currentBalance = Number(
      (this.initialBalance - sumOfAllExpenses).toFixed(2)
    );
  }
}
