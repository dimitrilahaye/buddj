import MonthlyBudgetTemplate from "../models/monthly-template/MonthlyBudgetTemplate.js";
import IdProvider from "../ports/providers/IdProvider.js";

export default class MonthlyBudgetFactory {
  constructor(public readonly idProvider: IdProvider) {}

  create(outflow: { initialBalance: number; name: string }) {
    return new MonthlyBudgetTemplate({
      id: this.idProvider.get(),
      name: outflow.name,
      initialBalance: outflow.initialBalance,
    });
  }
}
