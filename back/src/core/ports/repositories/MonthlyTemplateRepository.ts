import MonthlyTemplate from "../../models/monthly-template/MonthlyTemplate.js";

export default interface MonthlyTemplateRepository {
  getDefault(): Promise<MonthlyTemplate | null>;
  getAll(): Promise<MonthlyTemplate[]>;
  getById(id: string): Promise<MonthlyTemplate | null>;
  save(template: MonthlyTemplate): Promise<MonthlyTemplate>;
}
