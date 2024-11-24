import YearlyOutflowRepository from "../ports/repositories/YearlyOutflowRepository.js";

export interface AddYearlyOutflowCommand {
  id: string;
  label: string;
  amount: number;
  month: number;
}

export default class AddYearlyOutflow {
  constructor(public yearlyOutflowRepository: YearlyOutflowRepository) {}

  async execute(command: AddYearlyOutflowCommand) {
    const list = await this.yearlyOutflowRepository.getAll();
    list.add(command);
    return this.yearlyOutflowRepository.add(command);
  }
}
