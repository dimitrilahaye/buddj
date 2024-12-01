import MonthlyOutflowTemplate from "../../models/template/MonthlyOutflowTemplate.js";

export default interface MonthlyOutflowTemplateRepository {
  getAllByTemplateId(templateId: string): Promise<MonthlyOutflowTemplate[]>;
}
