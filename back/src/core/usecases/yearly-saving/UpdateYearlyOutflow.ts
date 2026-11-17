import YearlyOutflowRepository from "../../ports/repositories/YearlyOutflowRepository.js";

export interface UpdateYearlyOutflowCommand {
  id: string;
  label: string;
  amount: number;
}

export default class UpdateYearlyOutflow {
  constructor(public yearlyOutflowRepository: YearlyOutflowRepository) {}

  async execute(command: UpdateYearlyOutflowCommand) {
    const list = await this.yearlyOutflowRepository.getAll();
    const updated = list.update(command.id, command.label, command.amount);
    return this.yearlyOutflowRepository.update(updated);
  }
}
