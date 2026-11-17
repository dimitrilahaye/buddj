import EventPublisher from "../../ports/providers/EventPublisher.js";
import MonthRepository from "../../ports/repositories/MonthRepository.js";
import UpdateExpenseCommand from "../../commands/UpdateExpenseCommand.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export default class UpdateExpense {
  constructor(
    public readonly monthRepository: MonthRepository,
    public readonly eventPublisher: EventPublisher
  ) {}

  async execute(command: UpdateExpenseCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.updateExpenseAmountFromWeeklyBudget(
      command.originalWeeklyId,
      command.expenseId,
      command.amount
    );
    month.updateExpenseLabelFromWeeklyBudget(
      command.originalWeeklyId,
      command.expenseId,
      command.label
    );
    month.updateExpenseWeeklyBudget(
      command.originalWeeklyId,
      command.newWeeklyId,
      command.expenseId
    );

    const savedMonth = await this.monthRepository.save(month);

    this.eventPublisher.publish("expenseUpdated", {
      expenseId: command.expenseId,
      label: command.label,
      amount: command.amount,
    });

    return savedMonth;
  }
}
