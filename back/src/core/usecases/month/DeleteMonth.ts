import MonthRepository from "../../ports/repositories/MonthRepository.js";
import DeleteMonthCommand from "../../commands/DeleteMonthCommand.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export default class DeleteMonth {
  constructor(public monthRepository: MonthRepository) {}

  async execute(command: DeleteMonthCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    await this.monthRepository.delete(month);

    return await this.monthRepository.findAllArchived();
  }
}
