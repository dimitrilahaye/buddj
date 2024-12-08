import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import MonthlyTemplate from "../../../core/models/monthly-template/MonthlyTemplate.js";
import MonthlyBudgetTemplate from "../../../core/models/monthly-template/MonthlyBudgetTemplate.js";

@Entity({ name: "monthly_budget_templates" })
export class MonthlyBudgetTemplateDao extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ name: "initial_balance", type: "decimal" })
  initialBalance: number;

  @Column({ name: "monthly_template_id", type: "uuid" })
  monthlyTemplateId: string;

  static fromDomain(
    monthlyTemplate: MonthlyTemplate,
    model: MonthlyBudgetTemplate
  ) {
    return MonthlyBudgetTemplateDao.create({
      id: model.id,
      name: model.name,
      initialBalance: Number(model.initialBalance),
      monthlyTemplateId: monthlyTemplate.id,
    });
  }

  toDomain(): MonthlyBudgetTemplate {
    return new MonthlyBudgetTemplate({
      id: this.id,
      initialBalance: Number(this.initialBalance),
      name: this.name,
    });
  }
}
