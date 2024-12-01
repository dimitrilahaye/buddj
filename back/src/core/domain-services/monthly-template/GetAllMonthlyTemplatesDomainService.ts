import MonthlyTemplate from "../../models/template/MonthlyTemplate.js";
import MonthlyBudgetTemplateRepository from "../../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../../ports/repositories/MonthlyTemplateRepository.js";
import addOutflowsAndBudgetsToTemplate from "./addOutflowsAndBudgetsToTemplate.js";

export default class GetAllMonthlyTemplatesDomainService {
  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository
  ) {}

  async execute() {
    const promises: Promise<MonthlyTemplate>[] = [];
    const templates = await this.monthlyTemplateRepository.getAll();

    templates.forEach((template) => {
      promises.push(
        addOutflowsAndBudgetsToTemplate(
          this.monthlyOutflowTemplateRepository,
          this.monthlyBudgetTemplateRepository,
          template
        )
      );
    });

    return await Promise.all(promises);
  }
}
