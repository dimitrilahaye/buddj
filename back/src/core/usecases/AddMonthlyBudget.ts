import GetMonthlyTemplateByIdDomainService from "../domain-services/monthly-template/GetMonthlyTemplateByIdDomainService.js";
import MonthlyBudgetFactory from "../factories/MonthlyBudgetFactory.js";
import IdProvider from "../ports/providers/IdProvider.js";
import MonthlyBudgetTemplateRepository from "../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../ports/repositories/MonthlyTemplateRepository.js";

export interface AddMonthlyBudgetCommand {
  templateId: string;
  initialBalance: number;
  name: string;
}

export default class AddMonthlyBudget {
  getMonthlyTemplateByIdDomainService: GetMonthlyTemplateByIdDomainService;

  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository,
    public factory: MonthlyBudgetFactory
  ) {
    this.getMonthlyTemplateByIdDomainService =
      new GetMonthlyTemplateByIdDomainService(
        this.monthlyTemplateRepository,
        this.monthlyOutflowTemplateRepository,
        this.monthlyBudgetTemplateRepository
      );
  }

  async execute(command: AddMonthlyBudgetCommand) {
    const template = await this.getMonthlyTemplateByIdDomainService.execute(
      command.templateId
    );
    const newBudget = this.factory.create(command);
    template.addBudget(newBudget);
    await this.monthlyBudgetTemplateRepository.save(
      command.templateId,
      newBudget
    );

    return template;
  }
}
