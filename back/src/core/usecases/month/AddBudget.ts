import AccountBudgetFactory from "../../factories/AccountBudgetFactory.js";
import MonthRepository from "../../ports/repositories/MonthRepository.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export interface AddBudgetCommand {
  monthId: string;
  name: string;
  initialBalance: number;
}

export default class AddBudget {
  constructor(
    public readonly accountBudgetFactory: AccountBudgetFactory,
    public readonly monthRepository: MonthRepository
  ) {}

  async execute(command: AddBudgetCommand) {
    const budget = this.accountBudgetFactory.create({
      name: command.name,
      initialBalance: command.initialBalance,
    });
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.addBudget(budget);

    await this.monthRepository.addBudget(month, budget);

    return month;
  }
}
