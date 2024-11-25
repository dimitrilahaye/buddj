import {
  YearlyOutflowsAddError,
  YearlyOutflowsIdDoesNotExistError,
} from "../../errors/YearlyOutflowsErrors.js";
import YearlyOutflow from "./YearlyOutflow.js";

export default class YearlyOutflows {
  private list: YearlyOutflow[];

  constructor(list: YearlyOutflow[]) {
    this.list = list;
  }

  getAll() {
    return this.list;
  }

  getMonthlyProjectsAmount() {
    const total = this.list.reduce((previous, current) => {
      return previous + current.amount;
    }, 0);
    return total / 12;
  }

  add(outflow: YearlyOutflow) {
    if (outflow.month < 1 || outflow.month > 12) {
      throw new YearlyOutflowsAddError();
    }
    this.list.push(outflow);
  }

  remove(id: string) {
    const outflow = this.list.find((o) => o.id === id);
    if (!outflow) {
      throw new YearlyOutflowsIdDoesNotExistError();
    }
    this.list = this.list.filter((o) => o.id !== id);
  }
}
