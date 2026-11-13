import EventPublisher from "../../ports/providers/EventPublisher.js";
import WeeklyExpenseFactory from "../../factories/WeeklyExpenseFactory.js";
import MonthRepository from "../../ports/repositories/MonthRepository.js";
import AddWeeklyExpenseCommand from "../../commands/AddWeeklyExpenseCommand.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export default class AddWeeklyExpense {
  constructor(
    public readonly weeklyExpenseFactory: WeeklyExpenseFactory,
    public readonly monthRepository: MonthRepository,
    public readonly eventPublisher: EventPublisher
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

    this.eventPublisher.publish("expenseAdded", {
      expenseId: expense.id,
      label: expense.label,
      amount: expense.amount,
      occurredAt: expense.date,
    });

    return month;
  }
}
