import EventPublisher from "../../ports/providers/EventPublisher.js";
import MonthRepository from "../../ports/repositories/MonthRepository.js";
import DeleteOutflowCommand from "../../commands/DeleteOutflowCommand.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export default class DeleteOutflow {
  constructor(
    public readonly monthRepository: MonthRepository,
    public readonly eventPublisher: EventPublisher
  ) {}

  async execute(command: DeleteOutflowCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.deleteOutflow(command.outflowId);

    await this.monthRepository.deleteOutflow(command.outflowId);

    this.eventPublisher.publish("outflowDeleted", {
      outflowId: command.outflowId,
    });

    return month;
  }
}
