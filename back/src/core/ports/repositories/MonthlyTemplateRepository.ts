import MonthlyTemplate from "../../models/template/MonthlyTemplate.js";

export default interface MonthlyTemplateRepository {
  getDefaultMonthlyTemplate(): Promise<MonthlyTemplate>;
}
