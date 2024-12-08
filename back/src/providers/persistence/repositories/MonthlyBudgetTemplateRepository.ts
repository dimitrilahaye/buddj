import MonthlyBudgetTemplate from "../../../core/models/monthly-template/MonthlyBudgetTemplate.js";
import MonthlyBudgetTemplateRepository from "../../../core/ports/repositories/MonthlyBudgetTemplateRepository.js";
import { MonthlyBudgetTemplateDao } from "../entities/MonthlyBudgetTemplate.js";

export default class TypeOrmMonthlyBudgetTemplateRepository
  implements MonthlyBudgetTemplateRepository
{
  async getAllByTemplateId(
    templateId: string
  ): Promise<MonthlyBudgetTemplate[]> {
    const budgets = await MonthlyBudgetTemplateDao.find({
      where: {
        monthlyTemplateId: templateId,
      },
    });

    return budgets.map((budget) => budget.toDomain());
  }

  async deleteById(budgetId: string): Promise<void> {
    await MonthlyBudgetTemplateDao.delete(budgetId);
  }
}
