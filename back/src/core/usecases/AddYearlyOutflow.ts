import YearlySavingFactory from "../factories/YearlySavingFactory.js";
import YearlyOutflowRepository from "../ports/repositories/YearlyOutflowRepository.js";

export interface AddYearlyOutflowCommand {
  label: string;
  amount: number;
  month: number;
  type: "outflow" | "budget";
}

export default class AddYearlyOutflow {
  constructor(
    public yearlyOutflowRepository: YearlyOutflowRepository,
    public factory: YearlySavingFactory
  ) {}

  async execute(command: AddYearlyOutflowCommand) {
    const list = await this.yearlyOutflowRepository.getAll();
    const saving = this.factory.create(command);
    list.add(saving);
    return this.yearlyOutflowRepository.add(saving);
  }
}
