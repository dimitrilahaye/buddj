import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import MonthlyOutflowTemplate from "../../../core/models/monthly-template/MonthlyOutflowTemplate.js";
import MonthlyTemplate from "../../../core/models/monthly-template/MonthlyTemplate.js";

@Entity({ name: "monthly_outflow_templates" })
export class MonthlyOutflowTemplateDao extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  label: string;

  @Column({ type: "decimal" })
  amount: number;

  @Column({ name: "monthly_template_id", type: "uuid" })
  monthlyTemplateId: string;

  static fromDomain(
    monthlyTemplate: MonthlyTemplate,
    model: MonthlyOutflowTemplate
  ) {
    return MonthlyOutflowTemplateDao.create({
      id: model.id,
      label: model.label,
      amount: Number(model.amount),
      monthlyTemplateId: monthlyTemplate.id,
    });
  }

  toDomain(): MonthlyOutflowTemplate {
    return new MonthlyOutflowTemplate({
      id: this.id,
      amount: Number(this.amount),
      label: this.label,
    });
  }
}
