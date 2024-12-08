import MonthlyOutflowTemplate from "../../models/monthly-template/MonthlyOutflowTemplate.js";

export default interface MonthlyOutflowTemplateRepository {
  getAllByTemplateId(templateId: string): Promise<MonthlyOutflowTemplate[]>;
  deleteById(outflowId: string): Promise<void>;
}
