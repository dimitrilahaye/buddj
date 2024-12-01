import MonthlyTemplate from "../../models/template/MonthlyTemplate.js";
import MonthlyBudgetTemplateRepository from "../../ports/repositories/MonthlyBudgetTemplateRepository.js";
import MonthlyOutflowTemplateRepository from "../../ports/repositories/MonthlyOutflowTemplateRepository.js";

export default async function addOutflowsAndBudgetsToTemplate(
  monthlyOutflowTemplateRepository: MonthlyOutflowTemplateRepository,
  monthlyBudgetTemplateRepository: MonthlyBudgetTemplateRepository,
  template: MonthlyTemplate
) {
  const outflowTemplates =
    await monthlyOutflowTemplateRepository.getAllByTemplateId(template.id);
  const budgetTemplates =
    await monthlyBudgetTemplateRepository.getAllByTemplateId(template.id);
  template.outflows = outflowTemplates;
  template.budgets = budgetTemplates;

  return template;
}
