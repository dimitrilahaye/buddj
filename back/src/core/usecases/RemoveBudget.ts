import MonthRepository from "../ports/repositories/MonthRepository.js";
import { MonthNotFoundError } from "../errors/MonthErrors.js";

export interface RemoveBudgetCommand {
  monthId: string;
  budgetId: string;
}

export default class RemoveBudget {
  constructor(public readonly monthRepository: MonthRepository) {}

  async execute(command: RemoveBudgetCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.removeBudget(command.budgetId);

    await this.monthRepository.removeBudget(command.budgetId);

    return month;
  }
}
