import MonthlyBudgetTemplate from "../../models/monthly-template/MonthlyBudgetTemplate.js";

export default interface MonthlyBudgetTemplateRepository {
  getAllByTemplateId(templateId: string): Promise<MonthlyBudgetTemplate[]>;
  deleteById(budgetId: string): Promise<void>;
  save(templateId: string, budget: MonthlyBudgetTemplate): Promise<void>;
}
