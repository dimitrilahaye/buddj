import GetMonthlyTemplateByIdDomainService from "../../domain-services/monthly-template/GetMonthlyTemplateByIdDomainService.js";
import MonthlyBudgetTemplateRepository from "../../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../../ports/repositories/MonthlyTemplateRepository.js";

export interface UpdateMonthlyBudgetCommand {
  templateId: string;
  budgetId: string;
  name: string;
  initialBalance: number;
}

export default class UpdateMonthlyBudget {
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

  async execute(command: UpdateMonthlyBudgetCommand) {
    const template = await this.getMonthlyTemplateByIdDomainService.execute(
      command.templateId
    );

    const updated = template.updateBudget(
      command.budgetId,
      command.name,
      command.initialBalance
    );

    await this.monthlyBudgetTemplateRepository.save(command.templateId, updated);

    return template;
  }
}
