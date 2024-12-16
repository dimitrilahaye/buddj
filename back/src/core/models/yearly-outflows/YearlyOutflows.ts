import {
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

  remove(id: string) {
    const outflow = this.outflowsList.find((o) => o.id === id);
    if (!outflow) {
      throw new YearlySavingsIdDoesNotExistError();
    }
    this.outflowsList = this.outflowsList.filter((o) => o.id !== id);
  }
}
