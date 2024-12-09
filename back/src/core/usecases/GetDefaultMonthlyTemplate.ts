import IdProvider from "../../providers/IdProvider.js";
import GetDefaultMonthlyTemplateDomainService from "../domain-services/monthly-template/GetDefaultMonthlyTemplateDomainService.js";
import MonthlyBudgetTemplateRepository from "../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../ports/repositories/MonthlyTemplateRepository.js";
import PendingDebitRepository from "../ports/repositories/PendingDebitRepository.js";
import YearlyOutflowRepository from "../ports/repositories/YearlyOutflowRepository.js";

export default class GetDefaultMonthlyTemplate {
  getDefaultMonthlyTemplateDomainService: GetDefaultMonthlyTemplateDomainService;

  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository,
    public pendingDebitRepository: PendingDebitRepository,
    public yearlyOutflowsRepository: YearlyOutflowRepository,
    public idProvider: IdProvider
  ) {
    this.getDefaultMonthlyTemplateDomainService =
      new GetDefaultMonthlyTemplateDomainService(
        this.monthlyTemplateRepository,
        this.monthlyOutflowTemplateRepository,
        this.monthlyBudgetTemplateRepository
      );
  }

  async execute() {
    const template =
      await this.getDefaultMonthlyTemplateDomainService.execute();
    if (!template) {
      return {
        template: null,
      };
    }

    const pendingDebits = await this.pendingDebitRepository.getAll();
    const yearlyOutflows = await this.yearlyOutflowsRepository.getAll();

    const monthlyProjectTotal = yearlyOutflows.getMonthlyProjectsAmount();
    template.addMonthlyProjectForAmount(this.idProvider, monthlyProjectTotal);

    return {
      pendingDebits,
      template,
    };
  }
}
