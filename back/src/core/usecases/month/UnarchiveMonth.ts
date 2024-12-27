import MonthRepository from "../../ports/repositories/MonthRepository.js";
import UnarchiveMonthCommand from "../../commands/UnarchiveMonthCommand.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export default class UnarchiveMonth {
  constructor(public monthRepository: MonthRepository) {}

  async execute(command: UnarchiveMonthCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.unarchive();

    await this.monthRepository.unarchive(month);

    return await this.monthRepository.findAllUnarchived();
  }
}
