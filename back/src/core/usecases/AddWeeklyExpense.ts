import WeeklyExpenseFactory from "../factories/WeeklyExpenseFactory.js";
import MonthRepository from "../ports/repositories/MonthRepository.js";
import AddWeeklyExpenseCommand from "../commands/AddWeeklyExpenseCommand.js";
import { MonthNotFoundError } from "../errors/MonthErrors.js";

export default class AddWeeklyExpense {
  constructor(
    public readonly weeklyExpenseFactory: WeeklyExpenseFactory,
    public readonly monthRepository: MonthRepository
  ) {}

  async execute(command: AddWeeklyExpenseCommand) {
    const expense = this.weeklyExpenseFactory.create({
      label: command.label,
      amount: command.amount,
    });
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.addExpenseToWeeklyBudget(command.weeklyBudgetId, expense);

    await this.monthRepository.updateWeeklyBudgetCurrentBalance(
      month,
      command.weeklyBudgetId
    );

    await this.monthRepository.addExpenseToWeeklyBudget(
      month,
      command.weeklyBudgetId,
      expense
    );

    return month;
  }
}
