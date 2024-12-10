import AccountOutflow from "./AccountOutflow.js";
import WeeklyBudget from "./WeeklyBudget.js";
import WeeklyExpense from "./WeeklyExpense.js";
import { WeeklyBudgetNotFoundError } from "../../../errors/WeeklyBudgetErrors.js";
import { AccountOutflowNotFoundError } from "../../../errors/AccountOuflowErrors.js";

export default class Account {
  id: string;
  currentBalance: number;
  outflows: AccountOutflow[] = [];
  weeklyBudgets: WeeklyBudget[] = [];

  constructor(props: {
    id: string;
    currentBalance: number;
    outflows: AccountOutflow[];
    weeklyBudgets: WeeklyBudget[];
  }) {
    this.id = props.id;
    this.currentBalance = props.currentBalance;
    this.outflows = props.outflows;
    this.weeklyBudgets = props.weeklyBudgets;
  }

  addExpenseToWeeklyBudget(weeklyId: string, expense: WeeklyExpense) {
    const weekly = this.findWeeklyBudgetById(weeklyId);
    weekly.addExpense(expense);
  }

  deleteExpenseFromWeeklyBudget(weeklyId: string, expenseId: string) {
    const weekly = this.findWeeklyBudgetById(weeklyId);
    weekly.deleteExpenseById(expenseId);
  }

  deleteOutflow(outflowId: string) {
    this.outflows = this.outflows.filter((outflow) => outflow.id !== outflowId);
  }

  addOutflow(outflow: AccountOutflow) {
    this.outflows.push(outflow);
  }

  /**
   * @deprecated
   */
  updateExpenseAmountFromWeeklyBudget(
    weeklyId: string,
    expenseId: string,
    amount: number
  ) {
    const weekly = this.findWeeklyBudgetById(weeklyId);
    weekly.updateExpenseAmount(expenseId, amount);
  }

  /**
   * @deprecated
   */
  updateExpenseLabelFromWeeklyBudget(
    weeklyId: string,
    expenseId: string,
    label: string
  ) {
    const weekly = this.findWeeklyBudgetById(weeklyId);
    weekly.updateExpenseLabel(expenseId, label);
  }

  checkExpense(weeklyId: string, expenseId: string) {
    const weekly = this.findWeeklyBudgetById(weeklyId);
    weekly.checkExpense(expenseId);
  }

  uncheckExpense(weeklyId: string, expenseId: string) {
    const weekly = this.findWeeklyBudgetById(weeklyId);
    weekly.uncheckExpense(expenseId);
  }

  checkOutflow(outflowId: string) {
    const outflow = this.findAccountOutflowById(outflowId);
    outflow.check();
  }

  uncheckOutflow(outflowId: string) {
    const outflow = this.findAccountOutflowById(outflowId);
    outflow.uncheck();
  }

  /**
   * @deprecated
   */
  updateExpenseWeeklyBudget(
    originalWeeklyId: string,
    newWeeklyId: string,
    expenseId: string
  ) {
    if (originalWeeklyId === newWeeklyId) {
      return;
    }
    const originalWeekly = this.findWeeklyBudgetById(originalWeeklyId);
    const expense = originalWeekly.findExpenseById(expenseId);
    this.deleteExpenseFromWeeklyBudget(originalWeeklyId, expenseId);
    this.addExpenseToWeeklyBudget(newWeeklyId, expense);
  }

  updateCurrentBalance(currentBalance: number) {
    this.currentBalance = currentBalance;
  }

  private findWeeklyBudgetById(weeklyId: string) {
    const weekly = this.weeklyBudgets.find((budget) => budget.id === weeklyId);
    if (weekly === undefined) {
      throw new WeeklyBudgetNotFoundError();
    }
    return weekly;
  }

  private findAccountOutflowById(outflowId: string) {
    const outflow = this.outflows.find((outflow) => outflow.id === outflowId);
    if (!outflow) {
      throw new AccountOutflowNotFoundError();
    }
    return outflow;
  }
}
