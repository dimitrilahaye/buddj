import MonthlyBudgetTemplateRepository from "../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../ports/repositories/MonthlyTemplateRepository.js";

export default class GetDefaultMonthlyTemplateDomainService {
  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository
  ) {}

  async execute() {
    const template = await this.monthlyTemplateRepository.getDefault();
    const outflowTemplates =
      await this.monthlyOutflowTemplateRepository.getAllByTemplateId(
        template.id
      );
    const budgetTemplates =
      await this.monthlyBudgetTemplateRepository.getAllByTemplateId(
        template.id
      );
    template.outflows = outflowTemplates;
    template.budgets = budgetTemplates;

    return template;
  }
}
