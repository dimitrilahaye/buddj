import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import YearlyOutflow from "../../../core/models/yearly-outflows/YearlyOutflow.js";

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

  static fromDomain(model: YearlyOutflow) {
    return YearlyOutflowDao.create({
      id: model.id,
      label: model.label,
      amount: Number(model.amount),
      month: Number(model.month),
    });
  }

  toDomain(): YearlyOutflow {
    return new YearlyOutflow({
      id: this.id,
      label: this.label,
      amount: Number(this.amount),
      month: Number(this.month),
    });
  }
}
