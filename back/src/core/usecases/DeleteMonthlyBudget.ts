import GetMonthlyTemplateByIdDomainService from "../domain-services/monthly-template/GetMonthlyTemplateByIdDomainService.js";
import MonthlyBudgetTemplateRepository from "../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../ports/repositories/MonthlyTemplateRepository.js";

export interface DeleteMonthlyBudgetCommand {
  templateId: string;
  budgetId: string;
}

export default class DeleteMonthlyBudget {
  getMonthlyTemplateByIdDomainService: GetMonthlyTemplateByIdDomainService;

  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository
  ) {
    this.getMonthlyTemplateByIdDomainService =
      new GetMonthlyTemplateByIdDomainService(
        this.monthlyTemplateRepository,
        this.monthlyOutflowTemplateRepository,
        this.monthlyBudgetTemplateRepository
      );
  }

  async execute(command: DeleteMonthlyBudgetCommand) {
    const template = await this.getMonthlyTemplateByIdDomainService.execute(
      command.templateId
    );

    template.removeBudget(command.budgetId);

    await this.monthlyBudgetTemplateRepository.deleteById(command.budgetId);

    return template;
  }
}
