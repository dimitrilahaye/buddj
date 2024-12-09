import { MonthlyTemplateDoesNotExistError } from "../../errors/MonthlyTemplateErrors.js";
import MonthlyBudgetTemplateRepository from "../../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../../ports/repositories/MonthlyTemplateRepository.js";
import addOutflowsAndBudgetsToTemplate from "./addOutflowsAndBudgetsToTemplate.js";

export default class GetMonthlyTemplateByIdDomainService {
  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository
  ) {}

  async execute(templateId: string) {
    const template = await this.monthlyTemplateRepository.getById(templateId);
    if (template === null) {
      throw new MonthlyTemplateDoesNotExistError();
    }
    return addOutflowsAndBudgetsToTemplate(
      this.monthlyOutflowTemplateRepository,
      this.monthlyBudgetTemplateRepository,
      template
    );
  }
}
