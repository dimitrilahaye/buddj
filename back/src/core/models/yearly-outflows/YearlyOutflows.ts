import {
  YearlySavingAmountMustBePositiveError,
  YearlySavingLabelCanNotBeEmptyError,
  YearlySavingsAddError,
  YearlySavingsIdDoesNotExistError,
  YearlySavingTypeDoesNotExistError,
} from "../../errors/YearlyOutflowsErrors.js";
import YearlyBudget from "./YearlyBudget.js";
import YearlyOutflow from "./YearlyOutflow.js";

export default class YearlyOutflows {
  private outflowsList: YearlyOutflow[] = [];
  private budgetsList: YearlyBudget[] = [];

  constructor(
    outflowsList: YearlyOutflow[] = [],
    budgetsList: YearlyBudget[] = []
  ) {
    this.outflowsList = outflowsList ?? [];
    this.budgetsList = budgetsList ?? [];
  }

  getAll() {
    return [...this.outflowsList, ...this.budgetsList];
  }

  getMonthlyProjectsAmount() {
    let total = this.outflowsList.reduce((previous, current) => {
      return previous + current.amount;
    }, 0);
    total += this.budgetsList.reduce((previous, current) => {
      return previous + current.initialBalance;
    }, 0);
    return Number((total / 12).toFixed(2));
  }

  add(saving: YearlyOutflow | YearlyBudget) {
    if (saving.month < 1 || saving.month > 12) {
      throw new YearlySavingsAddError();
    }
    switch (saving.type) {
      case "outflow":
        this.outflowsList.push(saving);
        break;
      case "budget":
        this.budgetsList.push(saving);
        break;
      default:
        throw new YearlySavingTypeDoesNotExistError();
    }
  }

  update(id: string, label: string, amount: number) {
    if (label.trim().length === 0) {
      throw new YearlySavingLabelCanNotBeEmptyError();
    }
    if (amount <= 0) {
      throw new YearlySavingAmountMustBePositiveError();
    }
    const outflowIndex = this.outflowsList.findIndex((o) => o.id === id);
    if (outflowIndex !== -1) {
      const current = this.outflowsList[outflowIndex];
      const updated = new YearlyOutflow({
        id,
        month: current.month,
        label,
        amount,
      });
      this.outflowsList[outflowIndex] = updated;
      return updated;
    }
    const budgetIndex = this.budgetsList.findIndex((b) => b.id === id);
    if (budgetIndex !== -1) {
      const current = this.budgetsList[budgetIndex];
      const updated = new YearlyBudget({
        id,
        month: current.month,
        name: label,
        initialBalance: amount,
      });
      this.budgetsList[budgetIndex] = updated;
      return updated;
    }
    throw new YearlySavingsIdDoesNotExistError();
  }

  remove(id: string) {
    const outflow = this.outflowsList.find((o) => o.id === id);
    const budget = this.budgetsList.find((o) => o.id === id);
    if (outflow) {
      this.outflowsList = this.outflowsList.filter((o) => o.id !== id);
    }
    if (budget) {
      this.budgetsList = this.budgetsList.filter((o) => o.id !== id);
    }
    if (!outflow && !budget) {
      throw new YearlySavingsIdDoesNotExistError();
    }
  }
}
