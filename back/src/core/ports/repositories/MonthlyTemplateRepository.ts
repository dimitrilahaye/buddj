import MonthlyTemplate from "../../models/template/MonthlyTemplate.js";

export default interface MonthlyTemplateRepository {
  getDefault(): Promise<MonthlyTemplate | null>;
}
