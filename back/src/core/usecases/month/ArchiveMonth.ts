import MonthRepository from "../../ports/repositories/MonthRepository.js";
import ArchiveMonthCommand from "../../commands/ArchiveMonthCommand.js";
import { MonthNotFoundError } from "../../errors/MonthErrors.js";

export default class ArchiveMonth {
  constructor(public monthRepository: MonthRepository) {}

  async execute(command: ArchiveMonthCommand) {
    const month = await this.monthRepository.getById(command.monthId);

    if (month === null) {
      throw new MonthNotFoundError();
    }

    month.archive();

    await this.monthRepository.archive(month);

    return month;
  }
}
