import MonthlyBudgetTemplate from "../../../core/models/template/MonthlyBudgetTemplate.js";
import MonthlyOutflowTemplate from "../../../core/models/template/MonthlyOutflowTemplate.js";
import MonthlyTemplate from "../../../core/models/template/MonthlyTemplate.js";
import MonthlyTemplateRepositoryInterface from "../../../core/ports/repositories/MonthlyTemplateRepository.js";
import env from "../../../env-vars.js";

export default class MonthlyTemplateRepository
  implements MonthlyTemplateRepositoryInterface
{
  async getDefaultMonthlyTemplate() {
    const props = {
      id: "id",
      name: "Template par défaut",
      isDefault: true,
      budgets: env.template.weeklyBudgets.map(
        ({ name }: { name: string }) =>
          new MonthlyBudgetTemplate({ id: "id", name, initialBalance: 200 })
      ),
      outflows: env.template.outflows.map(
        ({ label, amount }: { label: string; amount: number }) =>
          new MonthlyOutflowTemplate({ id: "id", label, amount })
      ),
    };

    return new MonthlyTemplate(props);
  }
}
