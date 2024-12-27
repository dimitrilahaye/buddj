import GetMonthlyTemplateByIdDomainService from "../../domain-services/monthly-template/GetMonthlyTemplateByIdDomainService.js";
import MonthlyOutflowFactory from "../../factories/MonthlyOutflowFactory.js";
import MonthlyBudgetTemplateRepository from "../../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../../ports/repositories/MonthlyTemplateRepository.js";

export interface AddMonthlyOutflowCommand {
  templateId: string;
  amount: number;
  label: string;
}

export default class AddMonthlyOutflow {
  getMonthlyTemplateByIdDomainService: GetMonthlyTemplateByIdDomainService;

  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository,
    public factory: MonthlyOutflowFactory
  ) {
    this.getMonthlyTemplateByIdDomainService =
      new GetMonthlyTemplateByIdDomainService(
        this.monthlyTemplateRepository,
        this.monthlyOutflowTemplateRepository,
        this.monthlyBudgetTemplateRepository
      );
  }

  async execute(command: AddMonthlyOutflowCommand) {
    const template = await this.getMonthlyTemplateByIdDomainService.execute(
      command.templateId
    );
    const newOutflow = this.factory.create(command);
    template.addOutflow(newOutflow);
    await this.monthlyOutflowTemplateRepository.save(
      command.templateId,
      newOutflow
    );

    return template;
  }
}
