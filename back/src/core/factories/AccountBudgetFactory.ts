import IdProvider from "../ports/providers/IdProvider.js";
import WeeklyBudget from "../models/month/account/WeeklyBudget.js";

export default class AccountBudgetFactory {
  constructor(public readonly idProvider: IdProvider) {}

  create(command: any): WeeklyBudget {
    return new WeeklyBudget({
      id: this.idProvider.get(),
      initialBalance: command.initialBalance,
      name: command.name,
    });
  }
}
