import GetAllMonthlyTemplatesDomainService from "../domain-services/monthly-template/GetAllMonthlyTemplatesDomainService.js";
import MonthlyTemplate from "../models/template/MonthlyTemplate.js";
import MonthlyBudgetTemplateRepository from "../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../ports/repositories/MonthlyTemplateRepository.js";

export default class GetAllMonthlyTemplates {
  getAllMonthlyTemplatesDomainService: GetAllMonthlyTemplatesDomainService;

  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository
  ) {
    this.getAllMonthlyTemplatesDomainService =
      new GetAllMonthlyTemplatesDomainService(
        this.monthlyTemplateRepository,
        this.monthlyOutflowTemplateRepository,
        this.monthlyBudgetTemplateRepository
      );
  }

  async execute(): Promise<MonthlyTemplate[]> {
    return await this.getAllMonthlyTemplatesDomainService.execute();
  }
}
