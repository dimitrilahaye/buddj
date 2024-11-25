import MonthCreationTemplateRepository from "../ports/repositories/MonthCreationTemplateRepository.js";
import PendingDebitRepository from "../ports/repositories/PendingDebitRepository.js";
import YearlyOutflowRepository from "../ports/repositories/YearlyOutflowRepository.js";

export default class GetMonthCreationTemplate {
  constructor(
    public monthCreationTemplateRepository: MonthCreationTemplateRepository,
    public pendingDebitRepository: PendingDebitRepository,
    public yearlyOutflowsRepository: YearlyOutflowRepository
  ) {}

  async execute() {
    const pendingDebits = await this.pendingDebitRepository.getAll();
    const template =
      await this.monthCreationTemplateRepository.getNewMonthTemplate();

    const yearlyOutflows = await this.yearlyOutflowsRepository.getAll();
    const monthlyProjectTotal = yearlyOutflows.getMonthlyProjectsAmount();
    template.addMonthlyProjectForAmount(monthlyProjectTotal);

    return {
      pendingDebits,
      template,
    };
  }
}
