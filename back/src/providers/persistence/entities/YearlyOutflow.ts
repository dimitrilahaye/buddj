import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import YearlyOutflow from "../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyBudget from "../../../core/models/yearly-outflows/YearlyBudget.js";

@Entity({ name: "yearly_outflows" })
export class YearlyOutflowDao extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  label: string;

  @Column({ type: "decimal" })
  amount: number;

  @Column({ type: "integer" })
  month: number;

  @Column({ type: "varchar", default: "outflow" })
  type: string;

  static fromDomain(model: YearlyOutflow | YearlyBudget) {
    if (model.type === "outflow") {
      return YearlyOutflowDao.create({
        id: model.id,
        label: model.label,
        amount: Number(model.amount),
        month: Number(model.month),
        type: model.type,
      });
    }
    return YearlyOutflowDao.create({
      id: model.id,
      label: model.name,
      amount: Number(model.initialBalance),
      month: Number(model.month),
      type: model.type,
    });
  }

  toDomain(): YearlyOutflow | YearlyBudget {
    if (this.type === "outflow") {
      return new YearlyOutflow({
        id: this.id,
        label: this.label,
        amount: Number(this.amount),
        month: Number(this.month),
      });
    }
    return new YearlyBudget({
      id: this.id,
      name: this.label,
      initialBalance: Number(this.amount),
      month: Number(this.month),
    });
  }
}
