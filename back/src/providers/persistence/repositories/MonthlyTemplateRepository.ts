import MonthlyTemplate from "../../../core/models/monthly-template/MonthlyTemplate.js";
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

  async getById(id: string): Promise<MonthlyTemplate | null> {
    const template = await MonthlyTemplateDao.findOne({
      where: {
        id,
      },
    });

    if (template === null) {
      return null;
    }
    return template.toDomain();
  }

  async save(template: MonthlyTemplate): Promise<MonthlyTemplate> {
    await MonthlyTemplateDao.update(template.id, {
      name: template.name,
      isDefault: template.isDefault,
    });
    const updatedTemplate = await MonthlyTemplateDao.findOne({
      where: {
        id: template.id,
      },
    });

    return updatedTemplate.toDomain();
  }
}
