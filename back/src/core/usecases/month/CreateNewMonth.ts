import MonthRepository from "../../ports/repositories/MonthRepository.js";
import MonthFactory from "../../factories/MonthFactory.js";
import MonthCreationCommand from "../../commands/MonthCreationCommand.js";

export default class CreateNewMonth {
  constructor(
    public monthRepository: MonthRepository,
    public monthFactory: MonthFactory
  ) {}

  async execute(command: MonthCreationCommand) {
    const month = this.monthFactory.create(command);
    return await this.monthRepository.save(month);
  }
}
