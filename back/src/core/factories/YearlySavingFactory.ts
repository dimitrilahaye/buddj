import IdProvider from "../ports/providers/IdProvider.js";
import YearlyOutflow from "../models/yearly-outflows/YearlyOutflow.js";
import YearlyBudget from "../models/yearly-outflows/YearlyBudget.js";
import { AddYearlyOutflowCommand } from "../usecases/AddYearlyOutflow.js";
import { YearlySavingTypeDoesNotExistError } from "../errors/YearlyOutflowsErrors.js";

export default class YearlySavingFactory {
  constructor(public readonly idProvider: IdProvider) {}

  create(command: AddYearlyOutflowCommand): YearlyOutflow | YearlyBudget {
    switch (command.type) {
      case "outflow":
        return new YearlyOutflow({
          ...command,
          id: this.idProvider.get(),
        });
      case "budget":
        return new YearlyBudget({
          ...command,
          name: command.label,
          initialBalance: command.amount,
          id: this.idProvider.get(),
        });
      default:
        throw new YearlySavingTypeDoesNotExistError();
    }
  }
}
