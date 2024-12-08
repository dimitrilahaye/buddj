import MonthlyOutflowTemplate from "../../../core/models/monthly-template/MonthlyOutflowTemplate.js";
import MonthlyOutflowTemplateRepository from "../../../core/ports/repositories/MonthlyOutflowTemplateRepository.js";
import { MonthlyOutflowTemplateDao } from "../entities/MonthlyOutflowTemplate.js";

export default class TypeOrmMonthlyOutflowTemplateRepository
  implements MonthlyOutflowTemplateRepository
{
  async getAllByTemplateId(
    templateId: string
  ): Promise<MonthlyOutflowTemplate[]> {
    const outflows = await MonthlyOutflowTemplateDao.find({
      where: {
        monthlyTemplateId: templateId,
      },
    });

    return outflows.map((outflow) => outflow.toDomain());
  }

  async deleteById(outflowId: string): Promise<void> {
    await MonthlyOutflowTemplateDao.delete(outflowId);
  }
}
