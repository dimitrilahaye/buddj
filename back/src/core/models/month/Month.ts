import Account from "./account/Account.js";
import Dashboard from "../dashboard/Dashboard.js";
import WeeklyExpense from "./account/WeeklyExpense.js";
import AccountOutflow from "./account/AccountOutflow.js";
import { AccountOutflowsError } from "../../errors/AccountErrors.js";

export default class Month {
  id: string;
  date: Date;
  account: Account;
  startAt: Date | null;
  endAt: Date | null;
  isArchived: boolean;

  constructor(props: {
    id: string;
    date: Date;
    account: Account;
    isArchived?: boolean;
  }) {
    this.id = props.id;
    this.date = props.date;
    this.account = props.account;
    this.startAt = null;
    this.endAt = null;
    this.isArchived = props.isArchived ?? false;
  }

  archive() {
    this.isArchived = true;
  }

  unarchive() {
    this.isArchived = false;
  }

  dashboard() {
    return new Dashboard({ account: this.account });
  }

  /**
   * @deprecated
   */
  updateExpenseWeeklyBudget(
    originalWeeklyId: string,
    newWeeklyId: string,
    expenseId: string
  ) {
    this.account.updateExpenseWeeklyBudget(
      originalWeeklyId,
      newWeeklyId,
      expenseId
    );
  }

  addExpenseToWeeklyBudget(weeklyId: string, expense: WeeklyExpense) {
    this.account.addExpenseToWeeklyBudget(weeklyId, expense);
  }

  deleteExpenseFromWeeklyBudget(weeklyId: string, expenseId: string) {
    this.account.deleteExpenseFromWeeklyBudget(weeklyId, expenseId);
  }

  /**
   * @deprecated
   */
  updateExpenseAmountFromWeeklyBudget(
    weeklyId: string,
    expenseId: string,
    amount: number
  ) {
    this.account.updateExpenseAmountFromWeeklyBudget(
      weeklyId,
      expenseId,
      amount
    );
  }

  deleteOutflow(outflowId: string) {
    if (this.account.outflows.length === 1) {
      throw new AccountOutflowsError();
    }
    this.account.deleteOutflow(outflowId);
  }

  addOutflow(outflow: AccountOutflow) {
    this.account.addOutflow(outflow);
  }

  /**
   * @deprecated
   */
  updateExpenseLabelFromWeeklyBudget(
    weeklyId: string,
    expenseId: string,
    label: string
  ) {
    this.account.updateExpenseLabelFromWeeklyBudget(weeklyId, expenseId, label);
  }

  checkExpense(weeklyId: string, expenseId: string) {
    this.account.checkExpense(weeklyId, expenseId);
  }

  uncheckExpense(weeklyId: string, expenseId: string) {
    this.account.uncheckExpense(weeklyId, expenseId);
  }

  checkOutflow(outflowId: string) {
    this.account.checkOutflow(outflowId);
  }

  uncheckOutflow(outflowId: string) {
    this.account.uncheckOutflow(outflowId);
  }

  updateAccountCurrentBalance(currentBalance: number) {
    this.account.updateCurrentBalance(currentBalance);
  }
}
