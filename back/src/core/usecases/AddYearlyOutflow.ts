import IdProvider from "../ports/providers/IdProvider.js";
import YearlyOutflowRepository from "../ports/repositories/YearlyOutflowRepository.js";

export interface AddYearlyOutflowCommand {
  label: string;
  amount: number;
  month: number;
}

export default class AddYearlyOutflow {
  constructor(
    public yearlyOutflowRepository: YearlyOutflowRepository,
    public idProvider: IdProvider
  ) {}

  async execute(command: AddYearlyOutflowCommand) {
    const list = await this.yearlyOutflowRepository.getAll();
    const outflow = {
      ...command,
      id: this.idProvider.get(),
    };
    list.add(outflow);
    return this.yearlyOutflowRepository.add(outflow);
  }
}
