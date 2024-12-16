import {
  YearlyOutflowsAddError,
  YearlyOutflowsIdDoesNotExistError,
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

  add(outflow: YearlyOutflow) {
    if (outflow.month < 1 || outflow.month > 12) {
      throw new YearlyOutflowsAddError();
    }
    this.outflowsList.push(outflow);
  }

  remove(id: string) {
    const outflow = this.outflowsList.find((o) => o.id === id);
    if (!outflow) {
      throw new YearlyOutflowsIdDoesNotExistError();
    }
    this.outflowsList = this.outflowsList.filter((o) => o.id !== id);
  }
}
