import WeeklyBudgetTemplate from "../../../core/models/template/WeeklyBudgetTemplate.js";
import OutflowTemplate from "../../../core/models/template/OutflowTemplate.js";
import MonthCreationTemplate from "../../../core/models/template/MonthCreationTemplate.js";
import MonthCreationTemplateRepositoryInterface from "../../../core/ports/repositories/MonthCreationTemplateRepository.js";
import env from "../../../env-vars.js";

export default class MonthCreationTemplateRepository
  implements MonthCreationTemplateRepositoryInterface
{
  async getNewMonthTemplate() {
    const props = {
      weeklyBudgets: env.template.weeklyBudgets.map(
        ({ name }: { name: string }) => new WeeklyBudgetTemplate({ name })
      ),
      outflows: env.template.outflows.map(
        ({ label, amount }: { label: string; amount: number }) =>
          new OutflowTemplate({ label, amount })
      ),
    };

    return new MonthCreationTemplate(props);
  }
}
