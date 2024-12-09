import GetMonthlyTemplateByIdDomainService from "../domain-services/monthly-template/GetMonthlyTemplateByIdDomainService.js";
import MonthlyBudgetTemplateRepository from "../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../ports/repositories/MonthlyTemplateRepository.js";

export interface DeleteMonthlyOutflowCommand {
  templateId: string;
  outflowId: string;
}

export default class DeleteMonthlyOutflow {
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

  async execute(command: DeleteMonthlyOutflowCommand) {
    const template = await this.getMonthlyTemplateByIdDomainService.execute(
      command.templateId
    );

    template.removeOutflow(command.outflowId);

    await this.monthlyOutflowTemplateRepository.deleteById(command.outflowId);

    return template;
  }
}
