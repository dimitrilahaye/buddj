import MonthRepository from "../../ports/repositories/MonthRepository.js";
import DeleteOutflowCommand from "../../commands/DeleteOutflowCommand.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export default class DeleteOutflow {
  constructor(public readonly monthRepository: MonthRepository) {}

  async execute(command: DeleteOutflowCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.deleteOutflow(command.outflowId);

    await this.monthRepository.deleteOutflow(command.outflowId);

    return month;
  }
}
