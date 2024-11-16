import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { WeeklyBudgetDao } from "./WeeklyBudget.js";
import WeeklyExpense from "../../../core/models/month/account/WeeklyExpense.js";

@Entity({ name: "weekly_expenses" })
export class WeeklyExpenseDao extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  label: string;

  @Column({ type: "decimal" })
  amount: number;

  @Column({ type: "boolean", name: "is_checked", default: false })
  isChecked: boolean;

  @Column({
    type: "timestamptz",
    name: "checked_at",
    default: null,
    nullable: true,
  })
  checkedAt: Date | null;

  @Column({ type: "timestamptz", name: "created_at" })
  date: Date;

  @ManyToOne(() => WeeklyBudgetDao, (budget) => budget.expenses, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "weekly_budget_id" })
  weeklyBudget: WeeklyBudgetDao;

  static fromDomain(model: WeeklyExpense) {
    return WeeklyExpenseDao.create({
      id: model.id,
      amount: Number(model.amount),
      isChecked: model.isChecked,
      label: model.label,
      date: new Date(model.date),
    });
  }

  toDomain(): WeeklyExpense {
    return new WeeklyExpense({
      id: this.id,
      amount: Number(this.amount),
      isChecked: this.isChecked,
      label: this.label,
      date: new Date(this.date),
    });
  }
}
