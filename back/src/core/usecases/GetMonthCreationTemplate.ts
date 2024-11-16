import MonthCreationTemplateRepository from "../ports/repositories/MonthCreationTemplateRepository.js";
import PendingDebitRepository from "../ports/repositories/PendingDebitRepository.js";

export default class GetMonthCreationTemplate {
  constructor(
    public monthCreationTemplateRepository: MonthCreationTemplateRepository,
    public pendingDebitRepository: PendingDebitRepository
  ) {}

  async execute() {
    const pendingDebits = await this.pendingDebitRepository.getAll();
    const template =
      await this.monthCreationTemplateRepository.getNewMonthTemplate();

    return {
      pendingDebits,
      template,
    };
  }
}
