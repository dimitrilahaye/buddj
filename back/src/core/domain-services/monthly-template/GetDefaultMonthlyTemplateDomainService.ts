import MonthlyBudgetTemplateRepository from "../../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../../ports/repositories/MonthlyTemplateRepository.js";
import addOutflowsAndBudgetsToTemplate from "./addOutflowsAndBudgetsToTemplate.js";

export default class GetDefaultMonthlyTemplateDomainService {
  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository
  ) {}

  async execute() {
    const template = await this.monthlyTemplateRepository.getDefault();
    if (!template) {
      return null;
    }

    return await addOutflowsAndBudgetsToTemplate(
      this.monthlyOutflowTemplateRepository,
      this.monthlyBudgetTemplateRepository,
      template
    );
  }
}
