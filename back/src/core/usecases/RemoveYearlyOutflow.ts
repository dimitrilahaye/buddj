import YearlyOutflowRepository from "../ports/repositories/YearlyOutflowRepository.js";

export interface RemoveYearlyOutflowCommand {
  id: string;
}

export default class RemoveYearlyOutflow {
  constructor(public yearlyOutflowRepository: YearlyOutflowRepository) {}

  async execute(command: RemoveYearlyOutflowCommand) {
    const list = await this.yearlyOutflowRepository.getAll();
    list.remove(command.id);
    return this.yearlyOutflowRepository.remove(command.id);
  }
}
