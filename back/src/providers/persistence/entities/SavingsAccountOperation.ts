import {
  BaseEntity,
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import SavingsAccountOperation, {
  SavingsAccountOperationType,
} from "../../../core/models/savings-account/SavingsAccountOperation.js";
import { SavingsAccountDao } from "./SavingsAccount.js";

@Entity({ name: "savings_account_operations" })
@Check(
  "CHK_savings_account_operations_type",
  `"type" IN ('deposit', 'withdrawal')`
)
@Check("CHK_savings_account_operations_amount", `"amount" > 0`)
@Index("IDX_savings_account_operations_account_date", [
  "savingsAccountId",
  "date",
])
export class SavingsAccountOperationDao extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "savings_account_id" })
  savingsAccountId: string;

  @ManyToOne(() => SavingsAccountDao, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "savings_account_id",
    foreignKeyConstraintName:
      "FK_savings_account_operations_savings_account_id",
  })
  savingsAccount?: SavingsAccountDao;

  @Column({ type: "varchar" })
  type: SavingsAccountOperationType;

  @Column({ type: "decimal" })
  amount: number;

  @Column({ type: "varchar", nullable: true })
  label: string | null;

  /** Jour calendaire de l'opération */
  @Column({ type: "date" })
  date: string;

  /** Départage l'ordre des opérations d'un même jour */
  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  static fromDomain(model: SavingsAccountOperation) {
    return SavingsAccountOperationDao.create({
      id: model.id,
      savingsAccountId: model.savingsAccountId,
      type: model.type,
      amount: Number(model.amount),
      label: model.label,
      date: model.date,
    });
  }

  toDomain(): SavingsAccountOperation {
    return new SavingsAccountOperation({
      id: this.id,
      savingsAccountId: this.savingsAccountId,
      type: this.type,
      amount: Number(this.amount),
      label: this.label,
      date: this.date,
    });
  }
}
