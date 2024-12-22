import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountDao } from "./Account.js";
import AccountOutflow from "../../../core/models/month/account/AccountOutflow.js";

@Entity({ name: "outflows" })
export class OutflowDao extends BaseEntity {
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

  @Column({
    type: "timestamptz",
    name: "pending_from",
    default: null,
    nullable: true,
  })
  pendingFrom: Date | null;

  @ManyToOne(() => AccountDao, (account) => account.outflows, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "account_id" })
  account: AccountDao;

  static fromDomain(model: AccountOutflow) {
    return OutflowDao.create({
      id: model.id,
      label: model.label,
      amount: Number(model.amount),
      isChecked: model.isChecked,
      checkedAt: null,
      pendingFrom: model.pendingFrom ? new Date(model.pendingFrom) : null,
    });
  }

  toDomain(): AccountOutflow {
    return new AccountOutflow({
      id: this.id,
      amount: Number(this.amount),
      isChecked: this.isChecked,
      label: this.label,
      pendingFrom: this.pendingFrom ? new Date(this.pendingFrom) : null,
    });
  }
}
