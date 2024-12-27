import MonthRepository from "../../ports/repositories/MonthRepository.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export interface UpdateBudgetCommand {
  monthId: string;
  budgetId: string;
  name: string;
}

export default class UpdateBudget {
  constructor(public readonly monthRepository: MonthRepository) {}

  async execute(command: UpdateBudgetCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.updateBudget(command.budgetId, command.name);

    await this.monthRepository.updateBudget(command.budgetId, command.name);

    return month;
  }
}
