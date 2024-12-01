import IdProvider from "../../providers/IdProvider.js";
import MonthlyTemplateRepository from "../ports/repositories/MonthlyTemplateRepository.js";
import PendingDebitRepository from "../ports/repositories/PendingDebitRepository.js";
import YearlyOutflowRepository from "../ports/repositories/YearlyOutflowRepository.js";

export default class GetDefaultMonthlyTemplate {
  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public pendingDebitRepository: PendingDebitRepository,
    public yearlyOutflowsRepository: YearlyOutflowRepository,
    public idProvider: IdProvider
  ) {}

  async execute() {
    const pendingDebits = await this.pendingDebitRepository.getAll();
    const template = await this.monthlyTemplateRepository.getDefault();

    const yearlyOutflows = await this.yearlyOutflowsRepository.getAll();
    const monthlyProjectTotal = yearlyOutflows.getMonthlyProjectsAmount();
    template.addMonthlyProjectForAmount(this.idProvider, monthlyProjectTotal);

    return {
      pendingDebits,
      template,
    };
  }
}
