import MonthlyTemplate from "../../../core/models/template/MonthlyTemplate.js";
import MonthlyTemplateRepository from "../../../core/ports/repositories/MonthlyTemplateRepository.js";
import { MonthlyTemplateDao } from "../entities/MonthlyTemplate.js";

export default class TypeOrmMonthlyTemplateRepository
  implements MonthlyTemplateRepository
{
  async getDefault(): Promise<MonthlyTemplate | null> {
    const template = await MonthlyTemplateDao.findOne({
      where: {
        isDefault: true,
      },
    });
    if (!template) {
      return null;
    }

    return template.toDomain();
  }

  async getAll(): Promise<MonthlyTemplate[]> {
    const templates = await MonthlyTemplateDao.find();

    return templates.map((template) => template.toDomain());
  }
}
