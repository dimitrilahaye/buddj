import SaveMonthlyTemplateDomainService from "../../domain-services/monthly-template/SaveMonthlyTemplateDomainService.js";
import { MonthlyTemplateDoesNotExistError } from "../../errors/MonthlyTemplateErrors.js";
import MonthlyBudgetTemplateRepository from "../../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../../ports/repositories/MonthlyOutflowTemplateRepository.js";
import MonthlyTemplateRepository from "../../ports/repositories/MonthlyTemplateRepository.js";

export interface UpdateMonthlyTemplateCommand {
  id: string;
  name: string;
  isDefault: boolean;
}

export default class UpdateMonthlyTemplate {
  saveMonthlyTemplateDomainService: SaveMonthlyTemplateDomainService;

  constructor(
    public monthlyTemplateRepository: MonthlyTemplateRepository,
    public monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
    public monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository
  ) {
    this.saveMonthlyTemplateDomainService =
      new SaveMonthlyTemplateDomainService(
        this.monthlyTemplateRepository,
        this.monthlyOutflowTemplateRepository,
        this.monthlyBudgetTemplateRepository
      );
  }

  async execute(command: UpdateMonthlyTemplateCommand) {
    const template = await this.monthlyTemplateRepository.getById(command.id);

    if (template === null) {
      throw new MonthlyTemplateDoesNotExistError();
    }

    template.updateName(command.name);
    template.updateIsDefault(command.isDefault);

    return this.saveMonthlyTemplateDomainService.execute(template);
  }
}
