import MonthlyTemplate from "../../models/monthly-template/MonthlyTemplate.js";
import MonthlyBudgetTemplateRepository from "../../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../../ports/repositories/MonthlyTemplateRepository.js";
import addOutflowsAndBudgetsToTemplate from "./addOutflowsAndBudgetsToTemplate.js";

export default class SaveMonthlyTemplateDomainService {
  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository
  ) {}

  async execute(template: MonthlyTemplate) {
    const updatedTemplate = await this.monthlyTemplateRepository.save(template);

    return await addOutflowsAndBudgetsToTemplate(
      this.monthlyOutflowTemplateRepository,
      this.monthlyBudgetTemplateRepository,
      updatedTemplate
    );
  }
}
