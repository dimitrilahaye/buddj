import GetMonthlyTemplateByIdDomainService from "../../domain-services/monthly-template/GetMonthlyTemplateByIdDomainService.js";
import MonthlyBudgetTemplateRepository from "../../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../../ports/repositories/MonthlyTemplateRepository.js";

export interface UpdateMonthlyOutflowCommand {
  templateId: string;
  outflowId: string;
  label: string;
  amount: number;
}

export default class UpdateMonthlyOutflow {
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

  async execute(command: UpdateMonthlyOutflowCommand) {
    const template = await this.getMonthlyTemplateByIdDomainService.execute(
      command.templateId
    );

    const updated = template.updateOutflow(
      command.outflowId,
      command.label,
      command.amount
    );

    await this.monthlyOutflowTemplateRepository.save(command.templateId, updated);

    return template;
  }
}
