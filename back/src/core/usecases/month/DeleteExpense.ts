import EventPublisher from "../../ports/providers/EventPublisher.js";
import MonthRepository from "../../ports/repositories/MonthRepository.js";
import DeleteExpenseCommand from "../../commands/DeleteExpenseCommand.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export default class DeleteExpense {
  constructor(
    public readonly monthRepository: MonthRepository,
    public readonly eventPublisher: EventPublisher
  ) {}

  async execute(command: DeleteExpenseCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.deleteExpenseFromWeeklyBudget(command.weeklyId, command.expenseId);

    await this.monthRepository.deleteExpense(command.expenseId);

    await this.monthRepository.updateWeeklyBudgetCurrentBalance(
      month,
      command.weeklyId
    );

    this.eventPublisher.publish("expenseDeleted", {
      expenseId: command.expenseId,
    });

    return month;
  }
}
