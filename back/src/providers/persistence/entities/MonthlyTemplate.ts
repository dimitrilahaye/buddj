import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import MonthlyTemplate from "../../../core/models/template/MonthlyTemplate.js";

@Entity({ name: "monthly_templates" })
export class MonthlyTemplateDao extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ name: "is_default", type: "boolean" })
  isDefault: boolean;

  static fromDomain(model: MonthlyTemplate) {
    return MonthlyTemplateDao.create({
      id: model.id,
      name: model.name,
      isDefault: model.isDefault,
    });
  }

  toDomain(): MonthlyTemplate {
    return new MonthlyTemplate({
      id: this.id,
      isDefault: this.isDefault,
      name: this.name,
    });
  }
}
