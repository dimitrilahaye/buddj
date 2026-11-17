import EventPublisher from "../../ports/providers/EventPublisher.js";
import MonthRepository from "../../ports/repositories/MonthRepository.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export interface UpdateOutflowCommand {
  monthId: string;
  outflowId: string;
  label: string;
  amount: number;
}

export default class UpdateOutflow {
  constructor(
    public readonly monthRepository: MonthRepository,
    public readonly eventPublisher: EventPublisher
  ) {}

  async execute(command: UpdateOutflowCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    const outflow = month.updateOutflow(
      command.outflowId,
      command.label,
      command.amount
    );

    await this.monthRepository.updateOutflow(outflow);

    this.eventPublisher.publish("outflowUpdated", {
      outflowId: outflow.id,
      label: outflow.label,
      amount: outflow.amount,
    });

    return month;
  }
}
