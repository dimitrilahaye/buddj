import MonthlyBudgetTemplate from "../../models/template/MonthlyBudgetTemplate.js";

export default interface MonthlyBudgetTemplateRepository {
  getAllByTemplateId(templateId: string): Promise<MonthlyBudgetTemplate[]>;
}
